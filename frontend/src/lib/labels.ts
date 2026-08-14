import type { UserRole } from "@/lib/types";

const ROLE_BY_NUMBER: Record<number, UserRole> = {
  1: "Admin",
  2: "StoreManager",
  3: "Receiver",
  4: "KitchenManager",
  5: "Auditor",
};

export function normalizeRole(role: UserRole | number | string): UserRole {
  if (typeof role === "number") return ROLE_BY_NUMBER[role] ?? "Auditor";
  if (role in ROLE_BY_NUMBER) return ROLE_BY_NUMBER[Number(role)];
  return role as UserRole;
}

export function formatRole(role: UserRole | number | string) {
  const normalized = normalizeRole(role);
  return {
    Admin: "Admin",
    StoreManager: "Store Manager",
    Receiver: "Receiver",
    KitchenManager: "Kitchen Manager",
    Auditor: "Auditor",
  }[normalized];
}

export function formatCategory(value: string | number) {
  const labels: Record<string, string> = {
    Meat: "Meat",
    Alcohol: "Alcohol",
    CleaningSupplies: "Cleaning Supplies",
    Beverages: "Beverages",
    Vegetables: "Vegetables",
    Packaging: "Packaging",
    Miscellaneous: "Miscellaneous",
  };
  return labels[String(value)] ?? String(value);
}

export function formatStatus(value: string | number) {
  if (value === "PartiallyApproved" || value === 4) return "Partially Approved";
  return String(value);
}

export function statusBadgeVariant(status: string | number) {
  const s = String(status);
  if (s === "Approved" || s === "2") return "success" as const;
  if (s === "Pending" || s === "1") return "warning" as const;
  if (s === "Rejected" || s === "3") return "danger" as const;
  return "secondary" as const;
}
