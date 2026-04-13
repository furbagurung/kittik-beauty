export type UserRole = "admin" | "customer";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};
