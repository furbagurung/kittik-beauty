import cors from "cors";
import express from "express";
import { UPLOADS_ROOT } from "./config/uploads.js";
import authRoutes from "./routes/authRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reelRoutes from "./routes/reelRoutes.js";
const app = express();
app.set("trust proxy", true);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/banners", bannerRoutes);
app.use("/uploads", express.static(UPLOADS_ROOT));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "kittik-backend",
    timestamp: new Date().toISOString(),
  });
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

app.get("/api/debug-routes", (_req, res) => {
  res.json({
    ok: true,
    routes: ["/api/banners", "/api/health"],
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
