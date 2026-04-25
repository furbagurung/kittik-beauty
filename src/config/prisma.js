import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import "dotenv/config";

const adapter = new PrismaMariaDb({
host: "127.0.0.1",
  port: 3306,
  user: "kittik_user",
  password: "StrongPassword123!",
  database: "kittik",
});

export const prisma = new PrismaClient({ adapter });
