const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InventorySchema = new Schema(
  {
    itemName: { type: String, required: true },                      // "Cotton Fabric Roll" / "Men Shirt"
    sku: { type: String, unique: true, required: true, trim: true }, // unique stock code
    type: { type: String, enum: ["RawMaterial", "FinishedGood"], required: true },

    description: { type: String },

    category: { type: String },        // Fabric, Thread, Shirt, Pant, etc.
    size: { type: String },            // FG: S, M, L
    color: { type: String },

    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, default: "pcs" }, // pcs, meters, rolls, etc.

    reorderLevel: { type: Number, default: 0, min: 0 },  // alert threshold
    reorderQty:   { type: Number, default: 0, min: 0 },  // suggested reorder qty

    location: { type: String },        // bin/shelf code

    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" }, // optional FK
    costPerUnit: { type: Number, min: 0 },
    sellingPrice: { type: Number, min: 0 },

    lotNumber: { type: String },       // batch/lot
    expiryDate: { type: Date }         // if applicable
  },
  { timestamps: true }
);

// ✅ Useful indexes (no duplicate sku index)
InventorySchema.index({ type: 1, category: 1 });
InventorySchema.index({ quantity: 1 });
InventorySchema.index({
  itemName: "text",
  sku: "text",
  category: "text",
  color: "text",
  size: "text",
  location: "text"
});

// 🔹 Static method: find low stock items
InventorySchema.statics.findLowStock = function (type) {
  const filter = { $expr: { $lte: ["$quantity", "$reorderLevel"] } };
  if (type) filter.type = type;
  return this.find(filter).sort({ quantity: 1 });
};

// 🔹 Instance method: safely adjust stock without negatives
InventorySchema.methods.adjustStock = async function (amount) {
  const delta = Number(amount);
  if (Number.isNaN(delta)) throw new Error("amount must be a number");

  const newQty = this.quantity + delta;
  if (newQty < 0) throw new Error(`Insufficient stock. Current=${this.quantity}, change=${delta}`);

  this.quantity = newQty;
  return this.save();
};

module.exports = mongoose.model("Inventory", InventorySchema);
