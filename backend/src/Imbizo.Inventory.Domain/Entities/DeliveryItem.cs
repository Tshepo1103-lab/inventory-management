using Imbizo.Inventory.Domain.Common;

namespace Imbizo.Inventory.Domain.Entities;

public class DeliveryItem : BaseEntity
{
    public Guid DeliveryId { get; set; }
    public Delivery Delivery { get; set; } = null!;
    public Guid InventoryItemId { get; set; }
    public InventoryItem InventoryItem { get; set; } = null!;
    public decimal QuantityDelivered { get; set; }
    public decimal QuantityApproved { get; set; }
    public decimal QuantityDamaged { get; set; }
    public string? Notes { get; set; }
    public bool IsApproved { get; set; }
}
