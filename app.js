
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const deliveryRouter = require("./Routes/DeliverRoutes");
const trackingRouter = require("./Routes/TrackingRoutes");
const driverRoutes = require("./Routes/DriverRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/Drivers", driverRoutes);

// Routes
app.use("/Deliveries", deliveryRouter);
app.use("/Tracking", trackingRouter);

// MongoDB connection
mongoose.connect("mongodb+srv://Admin:KY2la1E2o02chQpv@cluster0.ebnqc1t.mongodb.net/")
  .then(() => console.log("✅ Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => console.log("🚀 Server running at http://localhost:5000"));
  })
  .catch((err) => console.log(err));

