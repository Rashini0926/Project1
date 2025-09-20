import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import orderRoutes from "./Route/orderRoute.js";
import clothingItemRoutes from "./Route/clothingItemRoute.js";

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
connectDB();

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/clothing-items", clothingItemRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Warehouse API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


