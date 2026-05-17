using Imbizo.Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Imbizo.Inventory.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<ApplicationUser> Users { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<InventoryItem> InventoryItems { get; }
    DbSet<Delivery> Deliveries { get; }
    DbSet<DeliveryItem> DeliveryItems { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AuditLog> AuditLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
