// Model/PurchaseRequisition.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/** One line on a PR */
const PRLineSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "Inventory", required: true },
    sku: { type: String, required: true },          // denormalized for convenience
    itemName: { type: String, required: true },     // denormalized
    uom: { type: String, default: "pcs" },
    qty: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, default: 0, min: 0 },
    notes: { type: String }
  },
  { _id: false }
);

const PurchaseRequisitionSchema = new Schema(
  {
    prNumber: { type: String, unique: true, index: true }, // e.g. PR-2025-00012
    supplier: { type: Schema.Types.ObjectId, ref: "suppliermodel" }, // optional
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Ordered", "PartiallyReceived", "Received", "Cancelled"],
      default: "Draft"
    },
    expectedDate: { type: Date },
    currency: { type: String, default: "LKR" },
    lines: { type: [PRLineSchema], validate: v => Array.isArray(v) && v.length > 0 },
    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    createdBy: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

// Generate PR number like PR-YYYY-xxxxx
async function nextPRNumber() {
  const year = new Date().getFullYear();
  const prefix = `PR-${year}-`;
  const last = await mongoose.model("PurchaseRequisition")
    .findOne({ prNumber: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .lean();

  const nextSeq = last?.prNumber ? Number(last.prNumber.split("-").pop()) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(5, "0")}`;
}

// Recalc totals before save
PurchaseRequisitionSchema.pre("save", async function (next) {
  this.lines = this.lines.map(l => ({
    ...l,
    lineTotal: Number(l.unitCost || 0) * Number(l.qty || 0)
  }));
  this.subtotal = this.lines.reduce((s, l) => s + l.lineTotal, 0);
  this.tax = 0; // add VAT logic here if needed
  this.total = this.subtotal + this.tax;

  if (!this.prNumber) this.prNumber = await nextPRNumber();
  next();
});

module.exports = mongoose.model("PurchaseRequisition", PurchaseRequisitionSchema);
