const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const inventoryRoutes = require("./Route/inventoryRoute");
const purchaseRequisitionsRoutes = require("./Route/purchaseRequisitions");
const supplierRoutes = require("./Route/supplierroutes");
const returnRouter = require("./Route/returnRoute");
const deliveryRouter = require("./Route/DeliverRoutes");
const trackingRouter = require("./Route/TrackingRoutes");
const driverRoutes = require("./Route/DriverRoutes");
const authRoutes = require("./Route/authRoutes");
const orderRoutes = require("./Route/orderRoute");
const clothingItemRoutes = require("./Route/clothingItemRoute");
const deliverRoutes = require("./Route/DeliverRoutes");


const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ API Routes
app.use("/suppliers", supplierRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/purchase-requisitions", purchaseRequisitionsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/clothing-items", clothingItemRoutes);
app.use("/returns", returnRouter);
app.use("/Drivers", driverRoutes);
app.use("/Deliveries", deliveryRouter);
app.use("/Tracking", trackingRouter);
app.use("/api/deliveries", deliverRoutes);

// ✅ User Management Routes


app.use("/auth", authRoutes);

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("🚀 Warehouse Backend API is running...");
});

// ✅ MongoDB Connection
const PORT = 5000;
const MONGO_URI =
  "mongodb+srv://Admin:KY2la1E2o02chQpv@cluster0.ebnqc1t.mongodb.net/test?retryWrites=true&w=majority";

mongoose.set("strictQuery", true);

(async () => {
  try {
    console.log("⏳ Connecting to MongoDB…");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message || err);
    process.exit(1);
  }
})();
