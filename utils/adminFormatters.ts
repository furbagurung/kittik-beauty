import type { OrderStatus } from "@/types/order";

const currencyFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-NP", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatAdminCurrency(value: number) {
  return currencyFormatter.format(value ?? 0);
}

export function formatAdminDate(value: string | Date | null) {
  if (!value) {
    return "No orders yet";
  }

  return dateFormatter.format(new Date(value));
}

export function getOrderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "pending_payment":
      return "Pending Payment";
    case "placed":
      return "Placed";
    case "paid":
      return "Paid";
    case "processing":
      return "Processing";
    case "delivered":
      return "Delivered";
    default:
      return status;
  }
}

export function getOrderStatusMeta(status: OrderStatus) {
  switch (status) {
    case "pending_payment":
      return {
        label: "Pending Payment",
        backgroundColor: "#fff7ed",
        textColor: "#c2410c",
      };
    case "paid":
      return {
        label: "Paid",
        backgroundColor: "#ecfdf5",
        textColor: "#047857",
      };
    case "processing":
      return {
        label: "Processing",
        backgroundColor: "#eff6ff",
        textColor: "#1d4ed8",
      };
    case "delivered":
      return {
        label: "Delivered",
        backgroundColor: "#eef2ff",
        textColor: "#4338ca",
      };
    case "placed":
    default:
      return {
        label: "Placed",
        backgroundColor: "#fff1f5",
        textColor: "#be185d",
      };
  }
}
