using Imbizo.Inventory.Domain.Enums;

namespace Imbizo.Inventory.Application.DTOs;

public class InventoryItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public InventoryCategory Category { get; set; }
    public decimal Quantity { get; set; }
    public UnitType UnitType { get; set; }
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SellingEstimate { get; set; }
    public decimal MinimumThreshold { get; set; }
    public DateTime? DateReceived { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsLowStock { get; set; }
}

public record CreateInventoryItemRequest(
    string Name,
    string Sku,
    string? Barcode,
    InventoryCategory Category,
    decimal Quantity,
    UnitType UnitType,
    Guid SupplierId,
    decimal CostPrice,
    decimal SellingEstimate,
    decimal MinimumThreshold,
    DateTime? ExpiryDate);

public record UpdateInventoryItemRequest(
    string Name,
    string Sku,
    string? Barcode,
    InventoryCategory Category,
    UnitType UnitType,
    Guid SupplierId,
    decimal CostPrice,
    decimal SellingEstimate,
    decimal MinimumThreshold,
    DateTime? ExpiryDate,
    bool IsActive);

public record SupplierDto(
    Guid Id,
    string Name,
    string Phone,
    string Email,
    string Address,
    string ContactPerson,
    bool IsActive,
    int DeliveryCount,
    decimal TotalDeliveredValue);

public record CreateSupplierRequest(
    string Name,
    string Phone,
    string Email,
    string Address,
    string ContactPerson);

public record UpdateSupplierRequest(
    string Name,
    string Phone,
    string Email,
    string Address,
    string ContactPerson,
    bool IsActive);

public class DeliveryItemDto
{
    public Guid Id { get; set; }
    public Guid InventoryItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal QuantityDelivered { get; set; }
    public decimal QuantityApproved { get; set; }
    public decimal QuantityDamaged { get; set; }
    public string? Notes { get; set; }
    public bool IsApproved { get; set; }
}

public class DeliveryDto
{
    public Guid Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime DeliveryDate { get; set; }
    public DeliveryStatus Status { get; set; }
    public string? DamagedNotes { get; set; }
    public string? InvoiceFilePath { get; set; }
    public string? ReceiverSignature { get; set; }
    public string? ManagerNotes { get; set; }
    public string ReceivedByName { get; set; } = string.Empty;
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<DeliveryItemDto> Items { get; set; } = [];
}

public record CreateDeliveryItemRequest(
    Guid InventoryItemId,
    decimal QuantityDelivered,
    decimal QuantityDamaged,
    string? Notes);

public record CreateDeliveryRequest(
    Guid SupplierId,
    string ReferenceNumber,
    DateTime DeliveryDate,
    string? DamagedNotes,
    string? ReceiverSignature,
    IReadOnlyList<CreateDeliveryItemRequest> Items);

public record ApproveDeliveryRequest(
    DeliveryStatus Status,
    string? ManagerNotes,
    IReadOnlyList<ApproveDeliveryItemRequest>? Items);

public record ApproveDeliveryItemRequest(
    Guid DeliveryItemId,
    decimal QuantityApproved,
    bool IsApproved);

public class StockMovementDto
{
    public Guid Id { get; set; }
    public Guid InventoryItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public StockMovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public decimal QuantityBefore { get; set; }
    public decimal QuantityAfter { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public string PerformedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public record CreateStockMovementRequest(
    Guid InventoryItemId,
    StockMovementType MovementType,
    decimal Quantity,
    string? Notes);

public class NotificationDto
{
    public Guid Id { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string? Link { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record DashboardDto(
    decimal TotalInventoryValue,
    int LowStockCount,
    int PendingApprovals,
    int TotalItems,
    int TotalSuppliers,
    IReadOnlyList<InventoryItemDto> LowStockItems,
    IReadOnlyList<DeliveryDto> RecentDeliveries,
    IReadOnlyList<StockMovementDto> RecentMovements,
    IReadOnlyList<CategorySummaryDto> CategorySummaries);

public record CategorySummaryDto(InventoryCategory Category, int ItemCount, decimal TotalValue);

public record ReportSummaryDto(string Title, DateTime GeneratedAt, object Data);
