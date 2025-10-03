// Controllers/inventoryController.js
const mongoose = require("mongoose");
const Inventory = require("../Model/inventoryModel");

// ---------- Helpers ----------
function validateCreate(body) {
  const errors = [];
  if (!body.itemName || String(body.itemName).trim() === "") errors.push("itemName is required");
  if (!body.sku || String(body.sku).trim() === "") errors.push("sku is required");
  if (!body.type || !["RawMaterial", "FinishedGood"].includes(body.type)) {
    errors.push('type is required and must be "RawMaterial" or "FinishedGood"');
  }
  return errors;
}

// ---------- Create ----------
exports.addItem = async (req, res) => {
  try {
    const errors = validateCreate(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    req.body.itemName = String(req.body.itemName).trim();
    req.body.sku = String(req.body.sku).trim();

    const item = await Inventory.create(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "SKU already exists" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Validation failed", errors: err.errors });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Read all ----------
exports.getAllItems = async (req, res) => {
  try {
    const { type, search, minQty, page = 1, limit = 20, sort = "-updatedAt" } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (minQty !== undefined) filter.quantity = { $gte: Number(minQty) };

    if (search) {
      const q = new RegExp(search, "i");
      filter.$or = [
        { itemName: q },
        { sku: q },
        { category: q },
        { color: q },
        { size: q },
        { location: q }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Inventory.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Inventory.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Read one ----------
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid item id format" });
    }
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Update ----------
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid item id format" });
    }
    const item = await Inventory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    return res.json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "SKU already exists" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Validation failed", errors: err.errors });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Partial Update ----------
exports.patchItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid item id format" });
    }
    const item = await Inventory.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    return res.json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "SKU already exists" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Validation failed", errors: err.errors });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Delete ----------
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid item id format" });
    }
    const item = await Inventory.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    return res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Low stock ----------
exports.getLowStock = async (req, res) => {
  try {
    const { type } = req.query;
    if (typeof Inventory.findLowStock === "function") {
      const items = await Inventory.findLowStock(type);
      return res.json({ success: true, data: items });
    }
    const filter = { $expr: { $lte: ["$quantity", "$reorderLevel"] } };
    if (type) filter.type = type;
    const items = await Inventory.find(filter).sort({ quantity: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Adjust stock ----------
exports.adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid item id format" });
    }
    if (amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, message: "amount (number) is required" });
    }

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (typeof item.adjustStock === "function") {
      await item.adjustStock(Number(amount));
    } else {
      const newQty = item.quantity + Number(amount);
      if (newQty < 0) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Current=${item.quantity}, attempted change=${amount}`
        });
      }
      item.quantity = newQty;
      await item.save();
    }

    return res.json({
      success: true,
      data: item,
      meta: { change: Number(amount), reason: reason || "ADJUST", note: note || "" }
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Validation failed", errors: err.errors });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /inventory/categories
exports.getRawMaterialCategories = async (req, res) => {
  try {
    // only get distinct categories where type is RawMaterial
    const categories = await Inventory.distinct("category", { type: "RawMaterial" });
    return res.json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Export all handlers properly
module.exports = {
  addItem: exports.addItem,
  getAllItems: exports.getAllItems,
  getItemById: exports.getItemById,
  updateItem: exports.updateItem,
  patchItem: exports.patchItem,
  deleteItem: exports.deleteItem,
  getLowStock: exports.getLowStock,
  adjustStock: exports.adjustStock,
  getRawMaterialCategories: exports.getRawMaterialCategories,
};
