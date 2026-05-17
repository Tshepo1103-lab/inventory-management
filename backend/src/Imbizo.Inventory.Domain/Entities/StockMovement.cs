using Imbizo.Inventory.Domain.Common;
using Imbizo.Inventory.Domain.Enums;

namespace Imbizo.Inventory.Domain.Entities;

public class StockMovement : BaseEntity
{
    public Guid InventoryItemId { get; set; }
    public InventoryItem InventoryItem { get; set; } = null!;
    public StockMovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public decimal QuantityBefore { get; set; }
    public decimal QuantityAfter { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public Guid? DeliveryId { get; set; }
    public Delivery? Delivery { get; set; }
    public Guid PerformedByUserId { get; set; }
    public ApplicationUser PerformedByUser { get; set; } = null!;
}
