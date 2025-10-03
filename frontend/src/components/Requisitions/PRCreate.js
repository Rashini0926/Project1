import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";

const INV_API = "http://localhost:5000/inventory";
const PR_API = "http://localhost:5000/purchase-requisitions";

const SUPPLIER_API = "http://localhost:5000/suppliers";

/* --- helpers to normalize payloads from backend --- */
function shapeInventoryPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.inventory)) return payload.inventory;
  if (payload?.data && typeof payload.data === "object") return [payload.data];
  return [];
}
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? String(d) : dt.toISOString().slice(0, 10);
};

/* --- main --- */
export default function PRCreate() {
  const navigate = useNavigate();
  const location = useLocation();

  /* header fields */
  const [supplier, setSupplier] = useState(""); // optional ObjectId or name (string)
  const [expectedDate, setExpectedDate] = useState("");
  const [currency, setCurrency] = useState("LKR");
  const [notes, setNotes] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierMaterial, setSelectedSupplierMaterial] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");


  /* inventory + lines */
  const [inventory, setInventory] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invErr, setInvErr] = useState("");

  const [lines, setLines] = useState([]); // [{ item, sku, itemName, uom, qty, unitCost, notes }]
  const [q, setQ] = useState("");

  /* submit state */
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(SUPPLIER_API);
        // your backend returns {suppliers: [...]}
        setSuppliers(Array.isArray(data?.suppliers) ? data.suppliers : []);
      } catch (e) {
        console.error("Failed to load suppliers:", e);
      }
    })();
  }, []);

  /* load inventory and prefill from ?items= */
  useEffect(() => {
    (async () => {
      setInvLoading(true);
      setInvErr("");
      try {
        const { data } = await axios.get(INV_API);
        const inv = shapeInventoryPayload(data);
        setInventory(inv);

        // Prefill from query string
        const params = new URLSearchParams(location.search);
        const idsParam = params.get("items");
        if (idsParam) {
          const wanted = new Set(
            idsParam
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          );
          const chosen = inv.filter((it) => wanted.has(String(it._id)));
          if (chosen.length) {
            setLines((prev) => {
              const existing = new Set(prev.map((p) => String(p.item)));
              const add = chosen
                .filter((it) => !existing.has(String(it._id)))
                .map((it) => {
                  const qtyNow = Number(it.quantity || 0);
                  const rl = Number(it.reorderLevel || 0);
                  const rq = Number(it.reorderQty || 0);
                  const deficit = Math.max(0, rl - qtyNow);
                  const suggested = Math.max(deficit, rq || 1) || 1;
                  return {
                    item: it._id,
                    sku: it.sku,
                    itemName: it.itemName,
                    uom: it.unit || "pcs",
                    qty: suggested,
                    unitCost: Number(it.costPerUnit || 0),
                    notes: "",
                  };
                });
              return [...prev, ...add];
            });
          }
        }
      } catch (e) {
        setInvErr(
          e?.response?.data?.message || e.message || "Failed to load inventory"
        );
      } finally {
        setInvLoading(false);
      }
    })();
  }, [location.search]);

  /* search inventory */
  const filteredInv = useMemo(() => {
  const term = q.trim().toLowerCase();
  return inventory
    .filter((it) => {
      // Filter by selected supplier material
      if (selectedSupplierMaterial && it.category !== selectedSupplierMaterial)
        return false;

      // Filter by search term
      if (!term) return true;
      const hay = [
        it?.itemName,
        it?.sku,
        it?.category,
        it?.color,
        it?.size,
        it?.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    })
    .slice(0, 10);
}, [inventory, q, selectedSupplierMaterial]);
  /* totals */
  const subtotal = useMemo(
    () =>
      lines.reduce(
        (s, l) => s + Number(l.qty || 0) * Number(l.unitCost || 0),
        0
      ),
    [lines]
  );
  const tax = 0;
  const total = subtotal + tax;

  /* handlers */
  const addLine = (it) => {
    setLines((prev) => {
      if (prev.some((l) => String(l.item) === String(it._id))) return prev;
      const qtyNow = Number(it.quantity || 0);
      const rl = Number(it.reorderLevel || 0);
      const rq = Number(it.reorderQty || 0);
      const deficit = Math.max(0, rl - qtyNow);
      const suggested = Math.max(deficit, rq || 1) || 1;
      return [
        ...prev,
        {
          item: it._id,
          sku: it.sku,
          itemName: it.itemName,
          uom: it.unit || "pcs",
          qty: suggested,
          unitCost: Number(it.costPerUnit || 0),
          notes: "",
        },
      ];
    });
  };

  const removeLine = (idx) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const changeLine = (idx, key, value, isNumber = false) => {
    setLines((prev) =>
      prev.map((l, i) =>
        i === idx
          ? {
              ...l,
              [key]: isNumber ? (value === "" ? "" : Number(value)) : value,
            }
          : l
      )
    );
  };

  const validate = () => {
    if (!Array.isArray(lines) || lines.length === 0)
      return "Add at least one line item.";
    for (const l of lines) {
      if (!l.item) return "A line is missing item id.";
      if (Number(l.qty) <= 0) return "Qty must be greater than 0.";
      if (Number(l.unitCost) < 0) return "Unit cost cannot be negative.";
    }
    return "";
  };

  const submitPR = async (finalStatus /* "Draft" | "Submitted" */) => {
    setErr("");
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    const payload = {
      supplier: supplier || undefined, // pass through as given (ObjectId or free text if you later map it)
      expectedDate: expectedDate || undefined,
      currency: currency || "LKR",
      notes: notes || undefined,
      status: finalStatus === "Submitted" ? "Submitted" : "Draft",
      lines: lines.map((l) => ({
        item: l.item,
        qty: Number(l.qty) || 0,
        unitCost: Number(l.unitCost) || 0,
        notes: l.notes || undefined,
      })),
    };

    try {
      setSubmitting(true);
      const { data } = await axios.post(PR_API, payload);
      const pr = data?.data;
      alert(`✅ PR created${pr?.prNumber ? `: ${pr.prNumber}` : ""}`);
      // adjust the path to your PR list route if different
      navigate("/Requisitions");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to create PR");
    } finally {
      setSubmitting(false);
    }
  };
  const handleSupplierChange = async (e) => {
  const supplierId = e.target.value;
  setSupplier(supplierId);
  setSelectedSupplierId(supplierId);

  try {
    const res = await axios.get(`${SUPPLIER_API}/${supplierId}`);
    setSelectedSupplierMaterial(res.data.suppliers.Material);
  } catch (err) {
    console.error("Failed to fetch supplier material:", err);
    setSelectedSupplierMaterial(""); // reset if fetch fails
  }
};

  return (
    <div className="inventory-container">
      <Nav />

      {/* Header */}
      <div className="pagebar" style={{ marginTop: 8 }}>
        <div className="title">
          <div className="crumbs">Procurement • Requisitions</div>
          New Purchase Requisition
        </div>
        <div className="actions">
          <button
            className="btn outline"
            onClick={() => submitPR("Draft")}
            disabled={submitting || lines.length === 0}
            title={
              lines.length === 0 ? "Add at least one line" : "Save as Draft"
            }
          >
            Save Draft
          </button>
          <button
            className="btn primary"
            onClick={() => submitPR("Submitted")}
            disabled={submitting || lines.length === 0}
            title={
              lines.length === 0
                ? "Add at least one line"
                : "Submit for approval"
            }
          >
            Submit PR
          </button>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="panel error-text" style={{ marginTop: 10 }}>
          ⚠️ {err}
        </div>
      )}

      {/* PR Header fields */}
      <div className="panel" style={{ marginTop: 10 }}>
        <div className="panel-head">
          <div className="panel-title">PR Details</div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="label">Supplier</span>
            <select
              value={supplier}
              onChange={handleSupplierChange}
            >
              <option value="">— Select a supplier —</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.Name} ({s.Status})
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="label">Expected Date</span>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="label">Currency</span>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="LKR"
            />
          </label>
          <label
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span className="label">Notes</span>
            <textarea
              rows={2}
              placeholder="Any procurement notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Inventory picker */}
      <div className="panel" style={{ marginTop: 10 }}>
        <div className="panel-head">
          <div className="panel-title">Add Items</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Search inventory and click “Add”
          </div>
        </div>

        {invLoading ? (
          <div className="note">Loading inventory…</div>
        ) : invErr ? (
          <div className="error-text">Error: {invErr}</div>
        ) : (
          <>
            <div className="search" style={{ marginBottom: 10 }}>
              <span className="icon" aria-hidden>
                🔎
              </span>
              <input
                placeholder="Search by item, SKU, category, location…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>UoM</th>
                    <th>Reorder</th>
                    <th>Location</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInv.map((it) => (
                    <tr key={it._id}>
                      <td>{it.itemName}</td>
                      <td className="mono">{it.sku}</td>
                      <td>{it.type}</td>
                      <td>{it.category || "-"}</td>
                      <td>{it.quantity ?? "-"}</td>
                      <td>{it.unit || "pcs"}</td>
                      <td>{it.reorderLevel ?? "-"}</td>
                      <td>{it.location || "-"}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn tiny outline"
                          onClick={() => addLine(it)}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInv.length === 0 && (
                    <tr>
                      <td className="note" colSpan={9}>
                        No results.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* PR Lines */}
      <div className="panel" style={{ marginTop: 10, marginBottom: 16 }}>
        <div className="panel-head">
          <div className="panel-title">Lines</div>
          <div className="note">
            Subtotal: {currency}{" "}
            {subtotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            • Total: {currency}{" "}
            {total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "28%" }}>Item</th>
                <th>SKU</th>
                <th>UoM</th>
                <th style={{ width: 110 }}>Qty</th>
                <th style={{ width: 140 }}>Unit Cost</th>
                <th style={{ width: 160 }}>Line Total</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => {
                const lineTotal = Number(l.qty || 0) * Number(l.unitCost || 0);
                return (
                  <tr key={String(l.item) + idx}>
                    <td>{l.itemName}</td>
                    <td className="mono">{l.sku}</td>
                    <td>{l.uom || "pcs"}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={l.qty}
                        onChange={(e) =>
                          changeLine(idx, "qty", e.target.value, true)
                        }
                        style={{ width: 100 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={l.unitCost}
                        onChange={(e) =>
                          changeLine(idx, "unitCost", e.target.value, true)
                        }
                        style={{ width: 120 }}
                      />
                    </td>
                    <td className="mono">
                      {currency}{" "}
                      {lineTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn tiny outline"
                        onClick={() => removeLine(idx)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
              {lines.length === 0 && (
                <tr>
                  <td className="note" colSpan={7}>
                    No lines yet. Search inventory above and click “Add”.
                  </td>
                </tr>
              )}
              {lines.length > 0 && (
                <tr className="totals">
                  <td
                    colSpan={5}
                    style={{ textAlign: "right", fontWeight: 700 }}
                  >
                    Subtotal
                  </td>
                  <td className="mono" colSpan={2}>
                    {currency}{" "}
                    {subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
