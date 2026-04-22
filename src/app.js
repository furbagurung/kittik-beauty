import cors from "cors";
import express from "express";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reelRoutes from "./routes/reelRoutes.js";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Kittik backend is running" });
});

app.use("/api/auth", authRoutes);
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
