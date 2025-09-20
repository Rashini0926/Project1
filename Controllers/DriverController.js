const mongoose = require("mongoose");
const Driver = require("../Model/DriverModel");

const isId = (val) => mongoose.isValidObjectId(val);

// GET /Drivers?q=...  (optional search)
exports.getDrivers = async (req, res) => {
  try {
    const { q } = req.query || {};
    let filter = {};
    if (q) {
      const s = new RegExp(q, "i");
      filter = {
        $or: [
          { driverId: s }, { name: s }, { phone: s },
          { vehicleType: s }, { vehiclePlate: s },
          { licenseNumber: s }, { status: s },
        ],
      };
    }
    const drivers = await Driver.find(filter).sort({ createdAt: -1 });
    res.json({ drivers });
  } catch (err) {
    console.error("getDrivers error:", err);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
};

// GET /Drivers/:id   (accepts Mongo _id or driverId)
exports.getDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = isId(id) ? await Driver.findById(id) : await Driver.findOne({ driverId: id });
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json({ driver });
  } catch (err) {
    console.error("getDriver error:", err);
    res.status(500).json({ error: "Failed to fetch driver" });
  }
};

// POST /Drivers
exports.createDriver = async (req, res) => {
  try {
    const payload = req.body || {};
    // minimal guard rails
    if (!payload.driverId || !payload.name || !payload.phone || !payload.licenseNumber || !payload.status) {
      return res.status(400).json({ error: "driverId, name, phone, licenseNumber, status are required" });
    }
    const created = await Driver.create(payload);
    res.status(201).json({ driver: created });
  } catch (err) {
    console.error("createDriver error:", err);
    if (err?.code === 11000) {
      // duplicate key
      return res.status(409).json({ error: "Duplicate key", details: err.keyValue });
    }
    res.status(400).json({ error: err.message || "Failed to create driver" });
  }
};

// PUT /Drivers/:id  (accepts _id or driverId)
exports.updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = isId(id) ? { _id: id } : { driverId: id };
    const updated = await Driver.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Driver not found" });
    res.json({ driver: updated });
  } catch (err) {
    console.error("updateDriver error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Duplicate key", details: err.keyValue });
    }
    res.status(400).json({ error: err.message || "Failed to update driver" });
  }
};

// DELETE /Drivers/:id  (accepts _id or driverId)
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = isId(id) ? { _id: id } : { driverId: id };
    const deleted = await Driver.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ error: "Driver not found" });
    res.json({ message: "Driver deleted" });
  } catch (err) {
    console.error("deleteDriver error:", err);
    res.status(500).json({ error: "Failed to delete driver" });
  }
};
