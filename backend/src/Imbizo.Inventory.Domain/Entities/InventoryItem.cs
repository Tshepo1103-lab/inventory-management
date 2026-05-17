using Imbizo.Inventory.Domain.Common;
using Imbizo.Inventory.Domain.Enums;

namespace Imbizo.Inventory.Domain.Entities;

public class InventoryItem : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public InventoryCategory Category { get; set; }
    public decimal Quantity { get; set; }
    public UnitType UnitType { get; set; }
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public decimal CostPrice { get; set; }
    public decimal SellingEstimate { get; set; }
    public decimal MinimumThreshold { get; set; }
    public DateTime? DateReceived { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<DeliveryItem> DeliveryItems { get; set; } = new List<DeliveryItem>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}
