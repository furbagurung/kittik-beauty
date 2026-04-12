import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "kittik_user",
  password: "StrongPassword123!",
  database: "kittik",
});

export const prisma = new PrismaClient({ adapter });
