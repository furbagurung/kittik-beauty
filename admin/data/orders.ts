import type { Order } from "@/types/order";
export const orders: Order[] = [
  {
    id: "O-001",
    customer: "Furba Gurung",
    amount: "NPR 2,500",
    payment: "eSewa",
    status: "Paid",
    date: "2026-04-14",
  },
  {
    id: "O-002",
    customer: "Vedika",
    amount: "NPR 1,850",
    payment: "COD",
    status: "Pending",
    date: "2026-04-13",
  },
  {
    id: "O-003",
    customer: "Aabishkar",
    amount: "NPR 3,200",
    payment: "Khalti",
    status: "Processing",
    date: "2026-04-12",
  },
];
