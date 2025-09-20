const mongoose = require("mongoose");

const STATUS = ["Available", "On Duty", "On Leave", "Inactive"];
const VEHICLES = ["Bike", "Tuk", "Car", "Van", "Truck", "Other"];

const DriverSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: VEHICLES, default: "Bike" },
    vehiclePlate: { type: String, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: STATUS, default: "Available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
