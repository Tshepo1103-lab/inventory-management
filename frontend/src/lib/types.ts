export type UserRole = "Admin" | "StoreManager" | "Receiver" | "KitchenManager" | "Auditor";

export type InventoryCategory =
  | "Meat"
  | "Alcohol"
  | "CleaningSupplies"
  | "Beverages"
  | "Vegetables"
  | "Packaging"
  | "Miscellaneous";

export type UnitType = "Kg" | "Litres" | "Bottles" | "Crates" | "Boxes" | "Units";
export type DeliveryStatus = "Pending" | "Approved" | "Rejected" | "PartiallyApproved";
export type StockMovementType = "Incoming" | "Outgoing" | "Wastage" | "Damaged" | "Transfer" | "Adjustment";
export type NotificationType = "LowStock" | "PendingApproval" | "RejectedDelivery" | "ExpiringStock" | "General";

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: InventoryCategory;
  quantity: number;
  unitType: UnitType;
  supplierId: string;
  supplierName: string;
  costPrice: number;
  sellingEstimate: number;
  minimumThreshold: number;
  dateReceived?: string;
  expiryDate?: string;
  isActive: boolean;
  isLowStock: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  isActive: boolean;
  deliveryCount: number;
  totalDeliveredValue: number;
}

export interface DeliveryItem {
  id: string;
  inventoryItemId: string;
  itemName: string;
  sku: string;
  quantityDelivered: number;
  quantityApproved: number;
  quantityDamaged: number;
  notes?: string;
  isApproved: boolean;
}

export interface Delivery {
  id: string;
  referenceNumber: string;
  supplierId: string;
  supplierName: string;
  deliveryDate: string;
  status: DeliveryStatus;
  damagedNotes?: string;
  invoiceFilePath?: string;
  receiverSignature?: string;
  managerNotes?: string;
  receivedByName: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  items: DeliveryItem[];
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  itemName: string;
  movementType: StockMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reference?: string;
  notes?: string;
  performedByName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Dashboard {
  totalInventoryValue: number;
  lowStockCount: number;
  pendingApprovals: number;
  totalItems: number;
  totalSuppliers: number;
  lowStockItems: InventoryItem[];
  recentDeliveries: Delivery[];
  recentMovements: StockMovement[];
  categorySummaries: { category: string; itemCount: number; totalValue: number }[];
}

export interface ReportSummary {
  title: string;
  generatedAt: string;
  data: unknown;
}
