using AutoMapper;
using Imbizo.Inventory.Application.Common;
using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Interfaces;
using Imbizo.Inventory.Domain.Entities;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Imbizo.Inventory.Application.Services;

public interface IStockMovementService
{
    Task<PagedResult<StockMovementDto>> GetAllAsync(int page, int pageSize, StockMovementType? type, Guid? itemId, CancellationToken ct = default);
    Task<StockMovementDto> CreateAsync(CreateStockMovementRequest request, CancellationToken ct = default);
}

public class StockMovementService(IApplicationDbContext db, IMapper mapper, ICurrentUserService currentUser) : IStockMovementService
{
    public async Task<PagedResult<StockMovementDto>> GetAllAsync(int page, int pageSize, StockMovementType? type, Guid? itemId, CancellationToken ct = default)
    {
        var query = db.StockMovements
            .Include(m => m.InventoryItem)
            .Include(m => m.PerformedByUser)
            .Where(m => !m.IsDeleted);

        if (type.HasValue) query = query.Where(m => m.MovementType == type.Value);
        if (itemId.HasValue) query = query.Where(m => m.InventoryItemId == itemId.Value);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(m => m.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<StockMovementDto>
        {
            Items = mapper.Map<List<StockMovementDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<StockMovementDto> CreateAsync(CreateStockMovementRequest request, CancellationToken ct = default)
    {
        if (!currentUser.UserId.HasValue)
            throw new UnauthorizedAccessException("User not authenticated.");

        var item = await db.InventoryItems.FirstAsync(i => i.Id == request.InventoryItemId, ct);
        var before = item.Quantity;
        var delta = request.MovementType is StockMovementType.Incoming or StockMovementType.Adjustment && request.Quantity > 0
            ? request.Quantity
            : -Math.Abs(request.Quantity);

        if (request.MovementType == StockMovementType.Adjustment)
            item.Quantity = request.Quantity;
        else
            item.Quantity = Math.Max(0, before + delta);

        item.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            InventoryItemId = item.Id,
            MovementType = request.MovementType,
            Quantity = Math.Abs(request.Quantity),
            QuantityBefore = before,
            QuantityAfter = item.Quantity,
            Notes = request.Notes,
            PerformedByUserId = currentUser.UserId.Value
        };

        db.StockMovements.Add(movement);
        await db.SaveChangesAsync(ct);

        var created = await db.StockMovements
            .Include(m => m.InventoryItem)
            .Include(m => m.PerformedByUser)
            .FirstAsync(m => m.Id == movement.Id, ct);

        return mapper.Map<StockMovementDto>(created);
    }
}
