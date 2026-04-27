import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import bannerRoutes from "./routes/bannerRoutes.js";
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected");
    app.use("/api/banners", bannerRoutes);  
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on network at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
