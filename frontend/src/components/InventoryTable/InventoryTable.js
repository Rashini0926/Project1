import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";
import "./InventoryTable.css";
import { useNavigate } from "react-router-dom";

const URL = "http://localhost:5000/inventory";

async function fetchInventory() {
  const res = await axios.get(URL);
  const payload = res.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.inventory)) return payload.inventory;
  if (payload?.data && typeof payload.data === "object") return [payload.data];
  return [];
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString();
}

export default function InventoryTable() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [onlyLow, setOnlyLow] = useState(false);

  const [sortKey, setSortKey] = useState("itemName");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchInventory();
        setItems(data);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const isLow = (it?.quantity ?? 0) <= (it?.reorderLevel ?? -Infinity);
      if (onlyLow && !isLow) return false;
      if (typeFilter !== "All" && it?.type !== typeFilter) return false;
      if (!q) return true;
      const hay = [
        it?.itemName, it?.sku, it?.category, it?.color, it?.size,
        it?.location, it?.lotNumber, String(it?.quantity ?? "")
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, typeFilter, onlyLow]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    data.sort((a, b) => {
      const A = a?.[sortKey], B = b?.[sortKey];
      const numeric = new Set(["quantity", "reorderLevel", "reorderQty"]);
      if (numeric.has(sortKey)) return (Number(A ?? 0) - Number(B ?? 0)) * dir;
      const dates = new Set(["expiryDate", "createdAt", "updatedAt"]);
      if (dates.has(sortKey)) return (new Date(A).getTime() - new Date(B).getTime()) * dir;
      return String(A ?? "").localeCompare(String(B ?? ""), "en", { sensitivity: "base" }) * dir;
    });
    return data;
  }, [filtered, sortKey, sortDir]);

  const lowCount = useMemo(
    () => items.filter((it) => (it?.quantity ?? 0) <= (it?.reorderLevel ?? -Infinity)).length,
    [items]
  );

  const onSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const thCell = (label, key) => {
    const active = sortKey === key;
    const arrow = active ? (sortDir === "asc" ? "↑" : "↓") : "↕";
    return (
      <th
        className={`th ${active ? "th-active" : ""}`}
        onClick={() => onSort(key)}
        title={`Sort by ${label}`}
      >
        {label} <span className="th-arrow">{arrow}</span>
      </th>
    );
  };

  return (
    // NOTE: "table-page" class lets CSS remove the left gap next to the sidebar.
    <div className="dddash">
      <Nav />
    <div className="inventory-container table-page">
      
      <div className="header-row">
        <h1 className="page-title">Inventory</h1>
        <div className="header-actions">
          <button className="btn outline" onClick={() => navigate("/InventoryDashboard")}>
            Dashboard
          </button>
          <button className="btn primary" onClick={() => navigate("/InventoryAdd")}>
            + New Item
          </button>
        </div>
      </div>

      <div className="controls">
        <div className="search-wrap">
          <span className="icon" aria-hidden>🔎</span>
          <input
            className="search-input"
            placeholder="Search item, SKU, category, color, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="RawMaterial">Raw Material</option>
          <option value="FinishedGood">Finished Good</option>
        </select>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={onlyLow}
            onChange={(e) => setOnlyLow(e.target.checked)}
          />
          Only Low Stock
        </label>

        <div className="status-text">
          Total: <b>{items.length}</b> | Low stock: <b>{lowCount}</b> | Showing: <b>{sorted.length}</b>
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {err && <p className="error-text">Error: {err}</p>}

      {!loading && !err && (
        <div className="table-card">
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  {thCell("#", "_row")}
                  {thCell("Item Name", "itemName")}
                  {thCell("SKU", "sku")}
                  {thCell("Type", "type")}
                  {thCell("Category", "category")}
                  {thCell("Size", "size")}
                  {thCell("Color", "color")}
                  {thCell("Qty", "quantity")}
                  {thCell("Unit", "unit")}
                  {thCell("Reorder Lvl", "reorderLevel")}
                  {thCell("Reorder Qty", "reorderQty")}
                  {thCell("Location", "location")}
                  {thCell("Lot", "lotNumber")}
                  {thCell("Expiry", "expiryDate")}
                  {thCell("Created", "createdAt")}
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td className="td center" colSpan={16}>No matching items</td>
                  </tr>
                ) : (
                  sorted.map((it, idx) => {
                    const isLow = (it?.quantity ?? 0) <= (it?.reorderLevel ?? -Infinity);
                    return (
                      <tr key={it._id || it.sku || idx} className={isLow ? "row-low" : ""}>
                        <td className="td mono">{idx + 1}</td>
                        <td className="td">
                          <div className="item-name-cell">
                            <div className="item-name">{it.itemName}</div>
                            {isLow && <span className="low-badge">LOW</span>}
                          </div>
                        </td>
                        <td className="td mono">{it.sku}</td>
                        <td className="td">
                          <span className={`pill ${it.type === "RawMaterial" ? "pill-raw" : "pill-fg"}`}>
                            {it.type || "-"}
                          </span>
                        </td>
                        <td className="td">{it.category || "-"}</td>
                        <td className="td">{it.size || "-"}</td>
                        <td className="td">{it.color || "-"}</td>
                        <td className="td right">{it.quantity ?? "-"}</td>
                        <td className="td">{it.unit || "-"}</td>
                        <td className="td right">{it.reorderLevel ?? "-"}</td>
                        <td className="td right">{it.reorderQty ?? "-"}</td>
                        <td className="td">{it.location || "-"}</td>
                        <td className="td mono">{it.lotNumber || "-"}</td>
                        <td className="td">{formatDate(it.expiryDate)}</td>
                        <td className="td">{formatDate(it.createdAt)}</td>
                        <td className="td">
                          <button
                            className="btn tiny primary"
                            onClick={() => navigate(`/UpdateInventory/${it._id}`)}
                            title="Edit item"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
