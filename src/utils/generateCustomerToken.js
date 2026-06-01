import jwt from "jsonwebtoken";

export function generateCustomerToken(customer) {
  return jwt.sign(
    {
      id: customer.id,
      role: customer.role,
      type: "customer",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}
