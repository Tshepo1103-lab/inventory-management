using AutoMapper;
using Imbizo.Inventory.Application.Common;
using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Interfaces;
using Imbizo.Inventory.Domain.Entities;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Imbizo.Inventory.Application.Services;

public interface IInventoryService
{
    Task<PagedResult<InventoryItemDto>> GetItemsAsync(int page, int pageSize, string? search, InventoryCategory? category, CancellationToken ct = default);
    Task<InventoryItemDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<InventoryItemDto> CreateAsync(CreateInventoryItemRequest request, CancellationToken ct = default);
    Task<InventoryItemDto?> UpdateAsync(Guid id, UpdateInventoryItemRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}

public class InventoryService(IApplicationDbContext db, IMapper mapper, ICurrentUserService currentUser) : IInventoryService
{
    public async Task<PagedResult<InventoryItemDto>> GetItemsAsync(int page, int pageSize, string? search, InventoryCategory? category, CancellationToken ct = default)
    {
        var query = db.InventoryItems
            .Include(i => i.Supplier)
            .Where(i => !i.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(i => i.Name.ToLower().Contains(term) || i.Sku.ToLower().Contains(term));
        }

        if (category.HasValue)
            query = query.Where(i => i.Category == category.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(i => i.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<InventoryItemDto>
        {
            Items = mapper.Map<List<InventoryItemDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<InventoryItemDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var item = await db.InventoryItems.Include(i => i.Supplier).FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, ct);
        return item is null ? null : mapper.Map<InventoryItemDto>(item);
    }

    public async Task<InventoryItemDto> CreateAsync(CreateInventoryItemRequest request, CancellationToken ct = default)
    {
        var item = new InventoryItem
        {
            Name = request.Name,
            Sku = request.Sku,
            Barcode = request.Barcode,
            Category = request.Category,
            Quantity = request.Quantity,
            UnitType = request.UnitType,
            SupplierId = request.SupplierId,
            CostPrice = request.CostPrice,
            SellingEstimate = request.SellingEstimate,
            MinimumThreshold = request.MinimumThreshold,
            DateReceived = DateTime.UtcNow,
            ExpiryDate = request.ExpiryDate
        };

        db.InventoryItems.Add(item);
        await db.SaveChangesAsync(ct);
        await LogAuditAsync("Create", "InventoryItem", item.Id, $"Created {item.Name}", ct);

        var created = await db.InventoryItems.Include(i => i.Supplier).FirstAsync(i => i.Id == item.Id, ct);
        return mapper.Map<InventoryItemDto>(created);
    }

    public async Task<InventoryItemDto?> UpdateAsync(Guid id, UpdateInventoryItemRequest request, CancellationToken ct = default)
    {
        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, ct);
        if (item is null) return null;

        item.Name = request.Name;
        item.Sku = request.Sku;
        item.Barcode = request.Barcode;
        item.Category = request.Category;
        item.UnitType = request.UnitType;
        item.SupplierId = request.SupplierId;
        item.CostPrice = request.CostPrice;
        item.SellingEstimate = request.SellingEstimate;
        item.MinimumThreshold = request.MinimumThreshold;
        item.ExpiryDate = request.ExpiryDate;
        item.IsActive = request.IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        await LogAuditAsync("Update", "InventoryItem", item.Id, $"Updated {item.Name}", ct);

        var updated = await db.InventoryItems.Include(i => i.Supplier).FirstAsync(i => i.Id == id, ct);
        return mapper.Map<InventoryItemDto>(updated);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, ct);
        if (item is null) return false;

        item.IsDeleted = true;
        item.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        await LogAuditAsync("Delete", "InventoryItem", item.Id, $"Deleted {item.Name}", ct);
        return true;
    }

    private async Task LogAuditAsync(string action, string entityType, Guid entityId, string details, CancellationToken ct)
    {
        if (!currentUser.UserId.HasValue) return;
        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId.Value,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details
        });
        await db.SaveChangesAsync(ct);
    }
}
