using Imbizo.Inventory.Domain.Enums;

namespace Imbizo.Inventory.Application.DTOs;

public record InventoryItemDto(
    Guid Id,
    string Name,
    string Sku,
    string? Barcode,
    InventoryCategory Category,
    decimal Quantity,
    UnitType UnitType,
    Guid SupplierId,
    string SupplierName,
    decimal CostPrice,
    decimal SellingEstimate,
    decimal MinimumThreshold,
    DateTime? DateReceived,
    DateTime? ExpiryDate,
    bool IsActive,
    bool IsLowStock);

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

public record DeliveryItemDto(
    Guid Id,
    Guid InventoryItemId,
    string ItemName,
    string Sku,
    decimal QuantityDelivered,
    decimal QuantityApproved,
    decimal QuantityDamaged,
    string? Notes,
    bool IsApproved);

public record DeliveryDto(
    Guid Id,
    string ReferenceNumber,
    Guid SupplierId,
    string SupplierName,
    DateTime DeliveryDate,
    DeliveryStatus Status,
    string? DamagedNotes,
    string? InvoiceFilePath,
    string? ReceiverSignature,
    string? ManagerNotes,
    string ReceivedByName,
    string? ApprovedByName,
    DateTime? ApprovedAt,
    DateTime CreatedAt,
    IReadOnlyList<DeliveryItemDto> Items);

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

public record StockMovementDto(
    Guid Id,
    Guid InventoryItemId,
    string ItemName,
    StockMovementType MovementType,
    decimal Quantity,
    decimal QuantityBefore,
    decimal QuantityAfter,
    string? Reference,
    string? Notes,
    string PerformedByName,
    DateTime CreatedAt);

public record CreateStockMovementRequest(
    Guid InventoryItemId,
    StockMovementType MovementType,
    decimal Quantity,
    string? Notes);

public record NotificationDto(
    Guid Id,
    NotificationType Type,
    string Title,
    string Message,
    bool IsRead,
    string? Link,
    DateTime CreatedAt);

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
