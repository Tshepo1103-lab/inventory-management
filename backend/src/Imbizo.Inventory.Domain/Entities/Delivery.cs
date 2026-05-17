using Imbizo.Inventory.Domain.Common;
using Imbizo.Inventory.Domain.Enums;

namespace Imbizo.Inventory.Domain.Entities;

public class Delivery : BaseEntity
{
    public string ReferenceNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public DateTime DeliveryDate { get; set; }
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Pending;
    public string? DamagedNotes { get; set; }
    public string? InvoiceFilePath { get; set; }
    public string? ReceiverSignature { get; set; }
    public string? ManagerNotes { get; set; }
    public Guid ReceivedByUserId { get; set; }
    public ApplicationUser ReceivedByUser { get; set; } = null!;
    public Guid? ApprovedByUserId { get; set; }
    public ApplicationUser? ApprovedByUser { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<DeliveryItem> Items { get; set; } = new List<DeliveryItem>();
}
