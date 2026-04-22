import cors from "cors";
import express from "express";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reelRoutes from "./routes/reelRoutes.js";

const app = express();
const defaultCorsOrigins = ["http://192.168.1.66:3000", "http://localhost:3000"];
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : defaultCorsOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Kittik backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reels", reelRoutes);
app.get("/", (_req, res) => {
  res.json({ message: "Kittik backend is running" });
});
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
