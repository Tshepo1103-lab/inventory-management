using AutoMapper;
using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Interfaces;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Imbizo.Inventory.Application.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(CancellationToken ct = default);
}

public class DashboardService(IApplicationDbContext db, IMapper mapper) : IDashboardService
{
    public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct = default)
    {
        var items = await db.InventoryItems
            .Include(i => i.Supplier)
            .Where(i => !i.IsDeleted && i.IsActive)
            .ToListAsync(ct);

        var lowStock = items.Where(i => i.Quantity <= i.MinimumThreshold).ToList();
        var totalValue = items.Sum(i => i.Quantity * i.CostPrice);

        var pendingApprovals = await db.Deliveries.CountAsync(d => d.Status == DeliveryStatus.Pending && !d.IsDeleted, ct);

        var recentDeliveries = await db.Deliveries
            .Include(d => d.Supplier)
            .Include(d => d.ReceivedByUser)
            .Include(d => d.ApprovedByUser)
            .Include(d => d.Items).ThenInclude(i => i.InventoryItem)
            .Where(d => !d.IsDeleted)
            .OrderByDescending(d => d.CreatedAt)
            .Take(5)
            .ToListAsync(ct);

        var recentMovements = await db.StockMovements
            .Include(m => m.InventoryItem)
            .Include(m => m.PerformedByUser)
            .Where(m => !m.IsDeleted)
            .OrderByDescending(m => m.CreatedAt)
            .Take(8)
            .ToListAsync(ct);

        var categorySummaries = items
            .GroupBy(i => i.Category)
            .Select(g => new CategorySummaryDto(g.Key, g.Count(), g.Sum(i => i.Quantity * i.CostPrice)))
            .OrderByDescending(c => c.TotalValue)
            .ToList();

        return new DashboardDto(
            totalValue,
            lowStock.Count,
            pendingApprovals,
            items.Count,
            await db.Suppliers.CountAsync(s => !s.IsDeleted && s.IsActive, ct),
            mapper.Map<List<InventoryItemDto>>(lowStock.Take(10)),
            mapper.Map<List<DeliveryDto>>(recentDeliveries),
            mapper.Map<List<StockMovementDto>>(recentMovements),
            categorySummaries);
    }
}
