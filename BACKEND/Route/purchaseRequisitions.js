// Route/purchaseRequisitions.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const PR = require("../Model/PurchaseRequisitionModel");
const Inventory = require("../Model/inventoryModel"); // make sure this file exists
const Supplier = require("../Model/suppliermodel");  // import supplier model


const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Basic validators */
function requireLines(body) {
  if (!Array.isArray(body?.lines) || body.lines.length === 0) {
    throw new Error("At least one line is required");
  }
}

/** Create PR (Draft or Submitted) */
router.post("/", async (req, res) => {
  try {
    requireLines(req.body);
    // ✅ Supplier validation
    if (req.body.supplier) {
      const sup = await Supplier.findById(req.body.supplier);
      if (!sup) {
        return res.status(400).json({ message: "Selected supplier not found" });
      }
      // ✅ New: ensure all line items match supplier's material
      if (Array.isArray(req.body.lines)) {
        for (const raw of req.body.lines) {
          const inv = await Inventory.findById(raw.item).lean();
          if (!inv) {
            return res.status(400).json({ message: `Inventory item not found: ${raw.item}` });
          }
          if (inv.category !== sup.Material) {
            return res.status(400).json({
              message: `Item "${inv.itemName}" does not match supplier material "${sup.Material}".`
            });
          }
        }
      }
    }
    // hydrate lines with current inventory data
    const lines = [];
    for (const raw of req.body.lines) {
      if (!isValidId(raw.item)) throw new Error(`Invalid item id: ${raw.item}`);
      const inv = await Inventory.findById(raw.item).lean();
      if (!inv) throw new Error(`Inventory item not found: ${raw.item}`);

      const qty = Number(raw.qty || 0);
      if (qty <= 0) throw new Error("Line qty must be > 0");

      lines.push({
        item: inv._id,
        sku: inv.sku,
        itemName: inv.itemName,
        uom: inv.unit || "pcs",
        qty,
        unitCost: Number(raw.unitCost ?? inv.costPerUnit ?? 0),
        notes: raw.notes
      });
    }

    const doc = await PR.create({
      supplier: req.body.supplier || null,
      expectedDate: req.body.expectedDate || null,
      currency: req.body.currency || "LKR",
      status: req.body.status === "Submitted" ? "Submitted" : "Draft",
      lines,
      createdBy: req.body.createdBy || "system",
      notes: req.body.notes
    });

    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/** List PRs (filter by status / q) */
router.get("/", async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.$or = [
      { prNumber: new RegExp(q, "i") },
      { notes: new RegExp(q, "i") },
      { "lines.sku": new RegExp(q, "i") },
      { "lines.itemName": new RegExp(q, "i") }
    ];

    const data = await PR.find(filter)
  .populate("supplier", "Name Status") // fetch supplier name & status
  .sort({ createdAt: -1 })
  .limit(200);
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/** Get one */
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const doc = await PR.findById(req.params.id)
  .populate("supplier", "Name Status");
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/** Update lines/fields (only Draft or Submitted) */
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const doc = await PR.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    if (!["Draft", "Submitted"].includes(doc.status))
      throw new Error("Only Draft/Submitted PRs can be edited");
    // ✅ Supplier validation
    if (req.body.supplier) {
      const sup = await Supplier.findById(req.body.supplier);
      if (!sup) {
        return res.status(400).json({ message: "Selected supplier not found" });
      }
      doc.supplier = req.body.supplier;
      // ✅ New: ensure all line items match supplier's material
  if (Array.isArray(req.body.lines)) {
    for (const raw of req.body.lines) {
      const inv = await Inventory.findById(raw.item).lean();
      if (!inv) {
        return res.status(400).json({ message: `Inventory item not found: ${raw.item}` });
      }
      if (inv.category !== sup.Material) {
        return res.status(400).json({
          message: `Item "${inv.itemName}" does not match supplier material "${sup.Material}".`
        });
      }
    }
  }
    }

    if (req.body.expectedDate !== undefined) doc.expectedDate = req.body.expectedDate;
    if (req.body.notes !== undefined) doc.notes = req.body.notes;

    if (Array.isArray(req.body.lines)) {
      const lines = [];
      for (const raw of req.body.lines) {
        if (!isValidId(raw.item)) throw new Error(`Invalid item id: ${raw.item}`);
        const inv = await Inventory.findById(raw.item).lean();
        if (!inv) throw new Error(`Inventory item not found: ${raw.item}`);
        const qty = Number(raw.qty || 0);
        if (qty <= 0) throw new Error("Line qty must be > 0");
        lines.push({
          item: inv._id,
          sku: inv.sku,
          itemName: inv.itemName,
          uom: inv.unit || "pcs",
          qty,
          unitCost: Number(raw.unitCost ?? inv.costPerUnit ?? 0),
          notes: raw.notes
        });
      }
      doc.lines = lines;
    }

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/** Transitions */
router.post("/:id/submit", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const doc = await PR.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    if (doc.status !== "Draft") return res.status(400).json({ success: false, message: "Only Draft → Submitted" });
    doc.status = "Submitted";
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.post("/:id/approve", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const doc = await PR.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    if (doc.status !== "Submitted")
      return res.status(400).json({ success: false, message: "Only Submitted → Approved" });
    doc.status = "Approved";
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.post("/:id/order", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const doc = await PR.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    if (doc.status !== "Approved")
      return res.status(400).json({ success: false, message: "Only Approved → Ordered" });
    doc.status = "Ordered";
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/** Receive (increments inventory) */
router.post("/:id/receive", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const doc = await PR.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    if (!["Ordered", "PartiallyReceived"].includes(doc.status))
      return res.status(400).json({ success: false, message: "Only Ordered/PartiallyReceived can be received" });

    const incoming = Array.isArray(req.body?.lines)
      ? req.body.lines
      : doc.lines.map(l => ({ item: l.item, qty: l.qty }));

    for (const rec of incoming) {
      if (!isValidId(rec.item)) continue;
      const inv = await Inventory.findById(rec.item);
      if (!inv) continue;
      await inv.adjustStock(Number(rec.qty || 0));
    }

    doc.status = "Received";
    await doc.save();

    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const doc = await PR.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    if (["Received", "Cancelled"].includes(doc.status))
      return res.status(400).json({ success: false, message: "This PR cannot be cancelled" });
    doc.status = "Cancelled";
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
