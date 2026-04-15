export type OrderStatus = "Paid" | "Pending" | "Processing";

export type Order = {
  id: string;
  customer: string;
  amount: string;
  payment: string;
  status: OrderStatus;
  date: string;
};
