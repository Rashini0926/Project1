import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";
import { useNavigate, useParams } from "react-router-dom";
import "./AddInventory.css";

const URL = "http://localhost:5000/inventory";

const isValidObjectId = (s) => /^[0-9a-fA-F]{24}$/.test((s || "").trim());

export default function AddInventory() {
  const navigate = useNavigate();
  const { id } = useParams(); // if present => edit mode

  const initial = {
    itemName: "",
    sku: "",
    type: "RawMaterial",
    category: "",
    size: "",
    color: "",
    quantity: 0,
    unit: "pcs",
    reorderLevel: 0,
    reorderQty: 0,
    location: "",
    lotNumber: "",
    supplier: "",
    costPerUnit: "",
    sellingPrice: "",
    expiryDate: "",
    description: "",
  };

  const [inputs, setInputs] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // preload if editing
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await axios.get(`${URL}/${id}`);
        const item = data?.data || data;
        setInputs((prev) => ({
          ...prev,
          ...item,
          supplier: item?.supplier || "",
          expiryDate: item?.expiryDate ? item.expiryDate.slice(0, 10) : "",
        }));
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const validate = () => {
    const errs = [];
    if (!inputs.itemName.trim()) errs.push("Item Name is required");
    if (!inputs.sku.trim()) errs.push("SKU is required");
    if (!["RawMaterial", "FinishedGood"].includes(inputs.type))
      errs.push("Type must be RawMaterial or FinishedGood");
    if (Number(inputs.quantity) < 0) errs.push("Quantity cannot be negative");
    if (Number(inputs.reorderLevel) < 0 || Number(inputs.reorderQty) < 0)
      errs.push("Reorder fields cannot be negative");
    if (inputs.supplier && !isValidObjectId(inputs.supplier))
      errs.push("Supplier must be a valid ObjectId (24 hex) or left blank");
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validate();
    if (errs.length) {
      setError(errs.join(", "));
      return;
    }

    const payload = {
      itemName: inputs.itemName.trim(),
      sku: inputs.sku.trim(),
      type: inputs.type,
      category: inputs.category || undefined,
      size: inputs.size || undefined,
      color: inputs.color || undefined,
      quantity: Number(inputs.quantity) || 0,
      unit: inputs.unit || undefined,
      reorderLevel: Number(inputs.reorderLevel) || 0,
      reorderQty: Number(inputs.reorderQty) || 0,
      location: inputs.location || undefined,
      lotNumber: inputs.lotNumber || undefined,
      supplier: isValidObjectId(inputs.supplier) ? inputs.supplier.trim() : undefined,
      costPerUnit: inputs.costPerUnit === "" ? undefined : Number(inputs.costPerUnit),
      sellingPrice: inputs.sellingPrice === "" ? undefined : Number(inputs.sellingPrice),
      expiryDate: inputs.expiryDate || undefined,
      description: inputs.description?.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (id) {
        await axios.put(`http://localhost:5000/inventory/${id}`, payload);
        alert("✅ Item updated");
      } else {
        await axios.post("http://localhost:5000/inventory", payload);
        alert("✅ Item created");
      }
      navigate("/InventoryTable");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.join(", ")
          : err.message);
      if (/E11000/.test(msg)) setError("SKU already exists. Use a unique SKU.");
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onReset = () => setInputs(initial);

  const onDelete = async () => {
    if (!id) return;
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/inventory/${id}`);
      alert("🗑️ Item deleted");
      navigate("/InventoryTable");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="inventory-container">
      <Nav />
      <div className="form-card">
        <h2 className="form-title">Create / Update Inventory Item</h2>

        <form onSubmit={onSubmit} className="grid-3">
          {/* ——— (all your fields, exactly as you posted earlier) ——— */}
          {/* Item Name */}
          <label className="form-field">
            <span className="label">Item Name *</span>
            <input
              name="itemName"
              type="text"
              placeholder={`e.g., "Cotton Fabric Roll" or "Men Shirt"`}
              value={inputs.itemName}
              onChange={handleChange}
              required
            />
            <small className="hint">maps to <b>itemName</b></small>
          </label>

          {/* SKU */}
          <label className="form-field">
            <span className="label">SKU *</span>
            <input
              name="sku"
              type="text"
              placeholder="FAB-60-NVY"
              value={inputs.sku}
              onChange={handleChange}
              required
            />
            <small className="hint">unique • maps to <b>sku</b></small>
          </label>

          {/* Type */}
          <label className="form-field">
            <span className="label">Type *</span>
            <select name="type" value={inputs.type} onChange={handleChange}>
              <option value="RawMaterial">RawMaterial</option>
              <option value="FinishedGood">FinishedGood</option>
            </select>
            <small className="hint">maps to <b>type</b> enum</small>
          </label>

          {/* Category */}
          <label className="form-field">
            <span className="label">Category</span>
            <input
              name="category"
              type="text"
              placeholder="Fabric / Thread / Shirt / Pant"
              value={inputs.category}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>category</b></small>
          </label>

          {/* Size */}
          <label className="form-field">
            <span className="label">Size</span>
            <input
              name="size"
              type="text"
              placeholder={`e.g., "S / M / L" or width`}
              value={inputs.size}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>size</b></small>
          </label>

          {/* Color */}
          <label className="form-field">
            <span className="label">Color</span>
            <input
              name="color"
              type="text"
              placeholder="Navy / Black / Grey"
              value={inputs.color}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>color</b></small>
          </label>

          {/* Quantity */}
          <label className="form-field">
            <span className="label">Quantity *</span>
            <input
              name="quantity"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={inputs.quantity}
              onChange={handleChange}
              required
            />
            <small className="hint">maps to <b>quantity</b></small>
          </label>

          {/* Unit */}
          <label className="form-field">
            <span className="label">Unit</span>
            <input
              name="unit"
              type="text"
              placeholder="pcs / rolls / meters"
              value={inputs.unit}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>unit</b></small>
          </label>

          {/* Location */}
          <label className="form-field">
            <span className="label">Location (Bin/Shelf)</span>
            <input
              name="location"
              type="text"
              placeholder="A1-BIN-03"
              value={inputs.location}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>location</b></small>
          </label>

          {/* Reorder Level */}
          <label className="form-field">
            <span className="label">Reorder Level</span>
            <input
              name="reorderLevel"
              type="number"
              min="0"
              step="1"
              placeholder="e.g., 20"
              value={inputs.reorderLevel}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>reorderLevel</b></small>
          </label>

          {/* Reorder Qty */}
          <label className="form-field">
            <span className="label">Suggested Reorder Qty</span>
            <input
              name="reorderQty"
              type="number"
              min="0"
              step="1"
              placeholder="e.g., 30"
              value={inputs.reorderQty}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>reorderQty</b></small>
          </label>

          {/* Supplier */}
          <label className="form-field">
            <span className="label">Supplier</span>
            <input
              name="supplier"
              type="text"
              placeholder="MongoDB ObjectId (24 hex) or leave blank"
              value={inputs.supplier}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>supplier</b> (ObjectId)</small>
          </label>

          {/* Cost / Unit */}
          <label className="form-field">
            <span className="label">Cost / Unit</span>
            <input
              name="costPerUnit"
              type="number"
              min="0"
              step="0.01"
              placeholder="LKR 0.00"
              value={inputs.costPerUnit}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>costPerUnit</b></small>
          </label>

          {/* Selling Price */}
          <label className="form-field">
            <span className="label">Selling Price</span>
            <input
              name="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="LKR 0.00"
              value={inputs.sellingPrice}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>sellingPrice</b></small>
          </label>

          {/* Lot Number */}
          <label className="form-field">
            <span className="label">Lot Number</span>
            <input
              name="lotNumber"
              type="text"
              placeholder="LOT-2412"
              value={inputs.lotNumber}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>lotNumber</b></small>
          </label>

          {/* Expiry Date */}
          <label className="form-field">
            <span className="label">Expiry Date</span>
            <input
              name="expiryDate"
              type="date"
              value={inputs.expiryDate}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>expiryDate</b></small>
          </label>

          {/* Description */}
          <label className="form-field col-span-3">
            <span className="label">Description</span>
            <textarea
              name="description"
              rows={3}
              placeholder="Notes (fabric width, composition, etc.)"
              value={inputs.description}
              onChange={handleChange}
            />
            <small className="hint">maps to <b>description</b></small>
          </label>

          {/* Actions */}
          <div className="form-actions col-span-3">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : id ? "Save Changes" : "Save Item"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onReset}>
              Reset
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onDelete}
              disabled={!id}
              title={!id ? "Delete enabled in edit mode" : "Delete this item"}
            >
              Delete Item
            </button>
          </div>

          {error && <div className="form-error col-span-3">⚠️ {error}</div>}
        </form>
      </div>
    </div>
  );
}
