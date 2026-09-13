/** Roles & permissions for the admin console (better-auth roles carry these as strings). */

export const ADMIN_ROLES = ["admin", "super_admin", "ops_manager", "procurement", "support", "finance", "content"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Administrator",
  ops_manager: "Operations manager",
  procurement: "Procurement officer",
  support: "Support agent",
  finance: "Finance officer",
  content: "Content editor",
  customer: "Customer",
};

export interface NavPermission {
  /** permission key required to see a module */
  key: string;
  label: string;
}

export const PERMISSIONS = {
  dashboard: ["admin", "super_admin", "ops_manager", "procurement", "support", "finance", "content"],
  orders: ["admin", "super_admin", "ops_manager", "support", "finance"],
  quotes: ["admin", "super_admin", "ops_manager", "procurement", "support"],
  products: ["admin", "super_admin", "ops_manager", "procurement", "content"],
  categories: ["admin", "super_admin", "content", "procurement"],
  customers: ["admin", "super_admin", "support", "finance", "ops_manager"],
  suppliers: ["admin", "super_admin", "procurement", "ops_manager"],
  purchaseOrders: ["admin", "super_admin", "procurement", "finance"],
  shipments: ["admin", "super_admin", "ops_manager", "procurement"],
  warehouses: ["admin", "super_admin", "ops_manager"],
  payments: ["admin", "super_admin", "finance"],
  wallet: ["admin", "super_admin", "finance", "support"],
  coupons: ["admin", "super_admin", "content"],
  groupBuys: ["admin", "super_admin", "content", "ops_manager"],
  reviews: ["admin", "super_admin", "content", "support"],
  tickets: ["admin", "super_admin", "support", "ops_manager"],
  cms: ["admin", "super_admin", "content"],
  reports: ["admin", "super_admin", "finance", "ops_manager"],
  staff: ["admin", "super_admin"],
  audit: ["admin", "super_admin", "finance"],
  settings: ["admin", "super_admin"],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export function can(role: string | undefined | null, permission: PermissionKey) {
  if (!role) return false;
  if (role === "super_admin") return true;
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

export function isAdminRole(role: string | undefined | null) {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}
