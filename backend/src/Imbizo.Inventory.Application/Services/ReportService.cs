using Imbizo.Inventory.Application.DTOs;
using Imbizo.Inventory.Application.Interfaces;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Imbizo.Inventory.Application.Services;

public interface IReportService
{
    Task<ReportSummaryDto> GetInventoryReportAsync(CancellationToken ct = default);
    Task<ReportSummaryDto> GetLowStockReportAsync(CancellationToken ct = default);
    Task<ReportSummaryDto> GetValuationReportAsync(CancellationToken ct = default);
    Task<ReportSummaryDto> GetDeliveryHistoryReportAsync(DateTime? from, DateTime? to, CancellationToken ct = default);
    Task<ReportSummaryDto> GetWastageReportAsync(CancellationToken ct = default);
}

public class ReportService(IApplicationDbContext db) : IReportService
{
    public async Task<ReportSummaryDto> GetInventoryReportAsync(CancellationToken ct = default)
    {
        var data = await db.InventoryItems
            .Include(i => i.Supplier)
            .Where(i => !i.IsDeleted)
            .Select(i => new
            {
                i.Name,
                i.Sku,
                Category = i.Category.ToString(),
                i.Quantity,
                Unit = i.UnitType.ToString(),
                i.CostPrice,
                Value = i.Quantity * i.CostPrice,
                Supplier = i.Supplier.Name
            })
            .ToListAsync(ct);

        return new ReportSummaryDto("Current Inventory", DateTime.UtcNow, data);
    }

    public async Task<ReportSummaryDto> GetLowStockReportAsync(CancellationToken ct = default)
    {
        var data = await db.InventoryItems
            .Where(i => !i.IsDeleted && i.Quantity <= i.MinimumThreshold)
            .Select(i => new { i.Name, i.Sku, i.Quantity, i.MinimumThreshold, Gap = i.MinimumThreshold - i.Quantity })
            .ToListAsync(ct);

        return new ReportSummaryDto("Low Stock", DateTime.UtcNow, data);
    }

    public async Task<ReportSummaryDto> GetValuationReportAsync(CancellationToken ct = default)
    {
        var data = await db.InventoryItems
            .Where(i => !i.IsDeleted)
            .GroupBy(i => i.Category)
            .Select(g => new
            {
                Category = g.Key.ToString(),
                ItemCount = g.Count(),
                TotalValue = g.Sum(i => i.Quantity * i.CostPrice)
            })
            .ToListAsync(ct);

        return new ReportSummaryDto("Stock Valuation", DateTime.UtcNow, data);
    }

    public async Task<ReportSummaryDto> GetDeliveryHistoryReportAsync(DateTime? from, DateTime? to, CancellationToken ct = default)
    {
        var query = db.Deliveries.Include(d => d.Supplier).Where(d => !d.IsDeleted);
        if (from.HasValue) query = query.Where(d => d.DeliveryDate >= from.Value);
        if (to.HasValue) query = query.Where(d => d.DeliveryDate <= to.Value);

        var data = await query
            .OrderByDescending(d => d.DeliveryDate)
            .Select(d => new
            {
                d.ReferenceNumber,
                Supplier = d.Supplier.Name,
                d.DeliveryDate,
                Status = d.Status.ToString(),
                ItemCount = d.Items.Count
            })
            .ToListAsync(ct);

        return new ReportSummaryDto("Delivery History", DateTime.UtcNow, data);
    }

    public async Task<ReportSummaryDto> GetWastageReportAsync(CancellationToken ct = default)
    {
        var data = await db.StockMovements
            .Include(m => m.InventoryItem)
            .Where(m => m.MovementType == StockMovementType.Wastage || m.MovementType == StockMovementType.Damaged)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new
            {
                Item = m.InventoryItem.Name,
                Type = m.MovementType.ToString(),
                m.Quantity,
                m.Notes,
                m.CreatedAt
            })
            .ToListAsync(ct);

        return new ReportSummaryDto("Wastage & Damaged Stock", DateTime.UtcNow, data);
    }
}
