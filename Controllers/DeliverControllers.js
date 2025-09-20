// Controllers/DeliveryControllers.js
const Deliver = require("../Model/DeliverModel");
const { isValidObjectId } = require("mongoose");

// GET /deliveries
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Deliver.find().lean();
    return res.status(200).json({ deliveries }); // empty array is OK
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch deliveries" });
  }
};

// POST /deliveries
const addDelivery = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ error: "Body is empty. Send JSON with Content-Type: application/json" });
    }

    const required = ["deliveryId", "orderId"];
    for (const f of required) {
      if (!req.body[f]) return res.status(400).json({ error: `${f} is required` });
    }

    const delivery = await Deliver.create(req.body);
    return res.status(201).json({ delivery });
  } catch (err) {
    console.error(err);
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Duplicate key", details: err.keyValue });
    }
    return res.status(500).json({ error: "Failed to create delivery" });
  }
};

// GET /deliveries/:id   (supports Mongo _id or deliveryId)
const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const filter = isValidObjectId(id) ? { _id: id } : { deliveryId: id };
    const delivery = await Deliver.findOne(filter);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    return res.status(200).json({ delivery });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch delivery" });
  }
};

// PATCH /deliveries/:id
const updateDelivery = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Body is empty" });
    }

    const filter = isValidObjectId(id) ? { _id: id } : { deliveryId: id };
    const updated = await Deliver.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Delivery not found" });
    return res.status(200).json({ delivery: updated });
  } catch (err) {
    console.error(err);
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Duplicate key", details: err.keyValue });
    }
    return res.status(500).json({ error: "Failed to update delivery" });
  }
};

// DELETE /deliveries/:id
const deleteDelivery = async (req, res) => {
  const { id } = req.params;
  try {
    const filter = isValidObjectId(id) ? { _id: id } : { deliveryId: id };
    const deleted = await Deliver.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ message: "Delivery not found" });
    return res.status(200).json({ message: "Delivery successfully deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete delivery" });
  }
};

exports.getAllDeliveries = getAllDeliveries;
exports.addDelivery = addDelivery;
exports.getById = getById;
exports.updateDelivery = updateDelivery;
exports.deleteDelivery = deleteDelivery;
