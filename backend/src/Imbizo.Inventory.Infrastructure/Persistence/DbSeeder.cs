using Imbizo.Inventory.Application.Services;
using Imbizo.Inventory.Domain.Entities;
using Imbizo.Inventory.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Imbizo.Inventory.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync()) return;

        logger.LogInformation("Seeding database...");

        var users = new List<ApplicationUser>
        {
            new() { Email = "admin@imbizo.co.za", FullName = "System Admin", Role = UserRole.Admin, PasswordHash = AuthService.HashPassword("Admin@123") },
            new() { Email = "manager@imbizo.co.za", FullName = "Thabo Mokoena", Role = UserRole.StoreManager, PasswordHash = AuthService.HashPassword("Manager@123") },
            new() { Email = "receiver@imbizo.co.za", FullName = "Nomsa Dlamini", Role = UserRole.Receiver, PasswordHash = AuthService.HashPassword("Receiver@123") },
            new() { Email = "kitchen@imbizo.co.za", FullName = "Sipho Nkosi", Role = UserRole.KitchenManager, PasswordHash = AuthService.HashPassword("Kitchen@123") },
            new() { Email = "auditor@imbizo.co.za", FullName = "Lerato Khumalo", Role = UserRole.Auditor, PasswordHash = AuthService.HashPassword("Auditor@123") }
        };
        db.Users.AddRange(users);

        var suppliers = new List<Supplier>
        {
            new() { Name = "Cape Meat Wholesalers", Phone = "+27 21 555 0101", Email = "orders@capemeat.co.za", Address = "Bellville, Cape Town", ContactPerson = "Johan van Wyk" },
            new() { Name = "SAB Distributor", Phone = "+27 11 555 0202", Email = "trade@sab.co.za", Address = "Johannesburg", ContactPerson = "Precious Mthembu" },
            new() { Name = "Fresh Veg Cape", Phone = "+27 21 555 0303", Email = "sales@freshveg.co.za", Address = "Epping, Cape Town", ContactPerson = "Maria Santos" },
            new() { Name = "CleanPro Hospitality", Phone = "+27 21 555 0404", Email = "info@cleanpro.co.za", Address = "Parow, Cape Town", ContactPerson = "David Petersen" }
        };
        db.Suppliers.AddRange(suppliers);
        await db.SaveChangesAsync();

        var items = new List<InventoryItem>
        {
            new() { Name = "Beef Short Ribs", Sku = "MEAT-001", Category = InventoryCategory.Meat, Quantity = 45, UnitType = UnitType.Kg, SupplierId = suppliers[0].Id, CostPrice = 89.50m, SellingEstimate = 180m, MinimumThreshold = 20, Barcode = "6001234000001" },
            new() { Name = "Chicken Wings", Sku = "MEAT-002", Category = InventoryCategory.Meat, Quantity = 60, UnitType = UnitType.Kg, SupplierId = suppliers[0].Id, CostPrice = 52.00m, SellingEstimate = 120m, MinimumThreshold = 25 },
            new() { Name = "Castle Lager 340ml", Sku = "ALC-001", Category = InventoryCategory.Alcohol, Quantity = 48, UnitType = UnitType.Crates, SupplierId = suppliers[1].Id, CostPrice = 420m, SellingEstimate = 650m, MinimumThreshold = 15 },
            new() { Name = "Coca-Cola 2L", Sku = "BEV-001", Category = InventoryCategory.Beverages, Quantity = 8, UnitType = UnitType.Units, SupplierId = suppliers[1].Id, CostPrice = 18.50m, SellingEstimate = 35m, MinimumThreshold = 24 },
            new() { Name = "Onions", Sku = "VEG-001", Category = InventoryCategory.Vegetables, Quantity = 30, UnitType = UnitType.Kg, SupplierId = suppliers[2].Id, CostPrice = 12.00m, SellingEstimate = 0m, MinimumThreshold = 15, ExpiryDate = DateTime.UtcNow.AddDays(7) },
            new() { Name = "Dishwashing Liquid 5L", Sku = "CLN-001", Category = InventoryCategory.CleaningSupplies, Quantity = 12, UnitType = UnitType.Units, SupplierId = suppliers[3].Id, CostPrice = 95m, SellingEstimate = 0m, MinimumThreshold = 5 },
            new() { Name = "Takeaway Boxes Large", Sku = "PKG-001", Category = InventoryCategory.Packaging, Quantity = 200, UnitType = UnitType.Units, SupplierId = suppliers[3].Id, CostPrice = 2.50m, SellingEstimate = 0m, MinimumThreshold = 100 },
            new() { Name = "Charcoal Bags", Sku = "MISC-001", Category = InventoryCategory.Miscellaneous, Quantity = 18, UnitType = UnitType.Units, SupplierId = suppliers[3].Id, CostPrice = 65m, SellingEstimate = 0m, MinimumThreshold = 10 }
        };
        db.InventoryItems.AddRange(items);
        await db.SaveChangesAsync();

        var receiver = users.First(u => u.Role == UserRole.Receiver);
        var delivery = new Delivery
        {
            ReferenceNumber = "DEL-2026-001",
            SupplierId = suppliers[0].Id,
            DeliveryDate = DateTime.UtcNow.AddDays(-2),
            Status = DeliveryStatus.Pending,
            ReceivedByUserId = receiver.Id,
            ReceiverSignature = "N. Dlamini"
        };
        delivery.Items.Add(new DeliveryItem
        {
            InventoryItemId = items[0].Id,
            QuantityDelivered = 20,
            QuantityDamaged = 0,
            QuantityApproved = 0
        });
        db.Deliveries.Add(delivery);

        db.StockMovements.Add(new StockMovement
        {
            InventoryItemId = items[2].Id,
            MovementType = StockMovementType.Outgoing,
            Quantity = 4,
            QuantityBefore = 52,
            QuantityAfter = 48,
            Notes = "Weekend service",
            PerformedByUserId = users.First(u => u.Role == UserRole.KitchenManager).Id
        });

        db.Notifications.Add(new Notification
        {
            UserId = users.First(u => u.Role == UserRole.StoreManager).Id,
            Type = NotificationType.LowStock,
            Title = "Low stock alert",
            Message = "Coca-Cola 2L (BEV-001) is below minimum threshold.",
            Link = "/inventory"
        });

        await db.SaveChangesAsync();
        logger.LogInformation("Database seeded successfully.");
    }
}
