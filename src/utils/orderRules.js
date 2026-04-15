const CUSTOMER_CANCELLABLE_STATUSES = new Set(["placed", "pending_payment"]);

const ADMIN_CANCELLABLE_STATUSES = new Set([
  "placed",
  "pending_payment",
  "processing",
]);

const STOCK_HOLDING_STATUSES = new Set([
  "placed",
  "pending_payment",
  "processing",
]);

export function canCustomerCancelOrder(order) {
  return CUSTOMER_CANCELLABLE_STATUSES.has(String(order.status || ""));
}

export function canAdminCancelOrder(order) {
  return ADMIN_CANCELLABLE_STATUSES.has(String(order.status || ""));
}

export function shouldRestoreStockOnCancellation(order, nextStatus) {
  if (String(nextStatus || "") !== "cancelled") return false;
  if (order.stockRestored) return false;

  return STOCK_HOLDING_STATUSES.has(String(order.status || ""));
}
