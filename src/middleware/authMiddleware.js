import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { getUserRole } from "../utils/adminHelpers.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      ...user,
      role: getUserRole(user.email),
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
