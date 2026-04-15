import type { Customer } from "@/types/customer";
export const customers: Customer[] = [
  {
    id: "C-001",
    name: "Furba Gurung",
    email: "furba@example.com",
    totalOrders: 5,
    totalSpend: "NPR 12,500",
    joinedAt: "2026-04-10",
  },
  {
    id: "C-002",
    name: "Vedika",
    email: "vedika@example.com",
    totalOrders: 3,
    totalSpend: "NPR 7,850",
    joinedAt: "2026-04-09",
  },
  {
    id: "C-003",
    name: "Aabishkar",
    email: "aabishkar@example.com",
    totalOrders: 2,
    totalSpend: "NPR 4,100",
    joinedAt: "2026-04-08",
  },
];
