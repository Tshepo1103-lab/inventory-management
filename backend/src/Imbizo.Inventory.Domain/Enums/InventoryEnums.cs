namespace Imbizo.Inventory.Domain.Enums;

public enum UserRole
{
    Admin = 1,
    StoreManager = 2,
    Receiver = 3,
    KitchenManager = 4,
    Auditor = 5
}

public enum InventoryCategory
{
    Meat = 1,
    Alcohol = 2,
    CleaningSupplies = 3,
    Beverages = 4,
    Vegetables = 5,
    Packaging = 6,
    Miscellaneous = 7
}

public enum UnitType
{
    Kg = 1,
    Litres = 2,
    Bottles = 3,
    Crates = 4,
    Boxes = 5,
    Units = 6
}

public enum DeliveryStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    PartiallyApproved = 4
}

public enum StockMovementType
{
    Incoming = 1,
    Outgoing = 2,
    Wastage = 3,
    Damaged = 4,
    Transfer = 5,
    Adjustment = 6
}

public enum NotificationType
{
    LowStock = 1,
    PendingApproval = 2,
    RejectedDelivery = 3,
    ExpiringStock = 4,
    General = 5
}
