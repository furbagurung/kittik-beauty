import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

export async function optionalOrderAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === "customer") {
      if (decoded.role !== "customer") {
        return res.status(403).json({ message: "Customer access only" });
      }

      const customer = await prisma.customer.findUnique({
        where: { id: Number(decoded.id) },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!customer || customer.status !== "active") {
        return res.status(401).json({ message: "Customer account is not active" });
      }

      req.customer = customer;
      next();
      return;
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
