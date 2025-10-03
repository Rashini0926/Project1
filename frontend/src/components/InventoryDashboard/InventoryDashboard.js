import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./InventoryDashboard.css";

/* --- APIs --- */
const INVENTORY_API = "http://localhost:5000/inventory";
const ORDERS_API = "http://localhost:5000/api/orders";
const PR_API = "http://localhost:5000/purchase-requisitions";

/* --- utils --- */
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? String(d) : dt.toISOString().slice(0, 10);
};
const inDays = (d1, d2) =>
  Math.floor(
    (new Date(d2).getTime() - new Date(d1).getTime()) /
      (1000 * 60 * 60 * 24)
  );

export default function InventoryDashboard() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("All"); // All | RawMaterial | FinishedGood
  const [query, setQuery] = useState("");

  /* fetch inventory */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(INVENTORY_API);
        const payload = res.data;
        const data =
          (Array.isArray(payload) && payload) ||
          (Array.isArray(payload?.data) && payload.data) ||
          [];
        setItems(data);
      } catch (e) {
        setErr(
          e?.response?.data?.message || e.message || "Failed to load inventory"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* filter (tabs + search) */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (tab !== "All" && it?.type !== tab) return false;
      if (!q) return true;
      const hay = [
        it?.itemName,
        it?.sku,
        it?.category,
        it?.color,
        it?.size,
        it?.location,
        it?.lotNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, tab, query]);

  /* KPIs */
  const onHandUnits = useMemo(
    () => filtered.reduce((sum, i) => sum + Number(i?.quantity || 0), 0),
    [filtered]
  );
  const invValue = useMemo(
    () =>
      filtered.reduce(
        (sum, i) =>
          sum + (Number(i?.quantity || 0) * Number(i?.costPerUnit || 0)),
        0
      ),
    [filtered]
  );
  const lowStockItems = useMemo(
    () =>
      filtered.filter(
        (i) => (i?.quantity ?? 0) <= (i?.reorderLevel ?? -Infinity)
      ),
    [filtered]
  );

  /* low stock top 6 */
  const lowTop6 = useMemo(() => {
    const rows = filtered
      .map((it) => {
        const qty = Number(it?.quantity || 0);
        const rl = Number(it?.reorderLevel || 0);
        const rq = Number(it?.reorderQty || 0);
        const deficit = Math.max(0, rl - qty);
        const suggested = Math.max(deficit, rq || 0);
        return { it, qty, rl, rq, deficit, suggested };
      })
      .filter((r) => r.qty <= r.rl)
      .sort((a, b) => b.deficit - a.deficit);
    return rows.slice(0, 6);
  }, [filtered]);

  /* category summary */
  const byCategory = useMemo(() => {
    const m = new Map();
    filtered.forEach((i) =>
      m.set(
        i?.category || "Uncategorized",
        (m.get(i?.category || "Uncategorized") || 0) +
          Number(i?.quantity || 0)
      )
    );
    return Array.from(m.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
  }, [filtered]);

  /* expiring within 60 days */
  const expiringSoon = useMemo(() => {
    const today = new Date();
    return filtered
      .filter((i) => i?.expiryDate)
      .map((i) => ({ ...i, days: inDays(today, i.expiryDate) }))
      .filter((x) => x.days >= 0 && x.days <= 60)
      .sort((a, b) => a.days - b.days);
  }, [filtered]);

  /* ✅ Place Order / Create PR */
  const placeOrder = async (item) => {
    const qty = prompt(`Enter quantity to order for ${item.itemName}:`);
    if (!qty || isNaN(qty) || Number(qty) <= 0) return;
    const quantity = Number(qty);

    try {
      if (item.quantity >= quantity) {
        // enough stock → create inventory order
        const orderPayload = {
          customer_Name: "Inventory Module",
          order_type: "inventory_Order", // ✅ mark as inventory order
          order_Items: [
            {
              product_Name: item.itemName,
              quantity,
              price: item.sellingPrice || 0,
              size: item.size,
              color: item.color,
            },
          ],
          email: "owner@shop.com",
          contact_No: "0700000000",
          delivery_Address: {
            street: "Main Street",
            city: "Colombo",
            district: "Western",
          },
          sub_Total: (item.sellingPrice || 0) * quantity,
          order_Status: "PENDING",
          description: `Order placed from InventoryDashboard`,
        };

        const res = await axios.post(ORDERS_API, orderPayload);
        const newOrder = res.data.newOrder || res.data.data || res.data;

        // reduce stock
        await axios.patch(`${INVENTORY_API}/${item._id}/adjust`, {
          amount: -quantity,
        });

        alert(`✅ Inventory Order created! ID: ${newOrder.order_id}`);
        navigate("/orders"); // ✅ go to Order Management dashboard
 // ✅ redirect to inventory orders
      } else {
        // not enough stock → create PR
        const prPayload = {
          lines: [
            {
              item: item._id,
              sku: item.sku,
              itemName: item.itemName,
              qty: quantity - item.quantity,
            },
          ],
          createdBy: "system",
          notes: `Auto-PR because stock insufficient for order`,
          status: "Submitted",
        };

        const prRes = await axios.post(PR_API, prPayload);
        alert(`⚠️ Not enough stock. PR Created: ${prRes.data.data?.prNumber}`);
        navigate("/Requisitions");
      }
    } catch (err) {
      console.error("Order error", err.response?.data || err.message);
      alert("❌ Failed to process order");
    }
  };

  return (
    <div className="inventory-container dashboard-page">
      {/* pagebar */}
      <div className="pagebar">
        <div className="title">Inventory Dashboard</div>
        <div className="actions">
          <button
            className="btn outline"
            onClick={() => navigate("/InventoryTable")}
          >
            View Table
          </button>
          <button
            className="btn primary"
            onClick={() => navigate("/InventoryAdd")}
          >
            + Add Inventory
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="label">On-hand Units</div>
          <div className="value">{onHandUnits.toLocaleString()}</div>
          <div className="sub">Across {filtered.length} SKUs</div>
        </div>
        <div className="kpi">
          <div className="label">Inventory Value</div>
          <div className="value">
            LKR{" "}
            {invValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="sub">Cost basis</div>
        </div>
        <div className="kpi">
          <div className="label">Low Stock Alerts</div>
          <div className="value">{lowStockItems.length}</div>
          <div className="sub">At or below reorder level</div>
        </div>
        <div className="kpi small">
          <div className="label">Filtered View</div>
          <div className="value">{filtered.length}</div>
          <div className="sub">Matching current filters</div>
        </div>
      </div>

      {loading && <div className="panel">Loading…</div>}
      {err && <div className="panel error-text">Error: {err}</div>}

      {!loading && !err && (
        <div className="grid">
          {/* LEFT */}
          <div className="col">
            {/* Low Stock */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Low Stock (Top 6)</div>
              </div>
              <div className="low-list">
                {lowTop6.length === 0 && (
                  <div className="note">No low stock items.</div>
                )}
                {lowTop6.map(({ it, qty, rl, suggested }) => (
                  <div key={it._id || it.sku} className="low-item">
                    <div className="low-title">
                      {it.itemName} <span className="badge low">LOW</span>
                    </div>
                    <div className="low-meta">
                      <span>Qty {qty}</span>
                      <span>Reorder {rl}</span>
                      <span>Suggest {suggested}</span>
                      <button
                        className="btn tiny primary"
                        onClick={() => placeOrder(it)}
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Stock */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Current Stock</div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>SKU</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Location</th>
                      <th>Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((it) => (
                      <tr key={it._id || it.sku}>
                        <td>{it.itemName}</td>
                        <td className="mono">{it.sku}</td>
                        <td>{it.quantity ?? "-"}</td>
                        <td>{it.unit || "-"}</td>
                        <td>{it.location || "-"}</td>
                        <td>{fmtDate(it.updatedAt)}</td>
                        <td>
                          <button
                            className="btn tiny primary"
                            onClick={() => placeOrder(it)}
                          >
                            Place Order
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="note">
                          No items match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col">
            {/* Category Summary */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Stock by Category</div>
              </div>
              <ul className="cat-list">
                {byCategory.map((r) => (
                  <li className="cat-row" key={r.name}>
                    <span className="name">{r.name}</span>
                    <span className="qty">{r.qty.toLocaleString()}</span>
                  </li>
                ))}
                {byCategory.length === 0 && (
                  <div className="note">No categories to show.</div>
                )}
              </ul>
            </div>

            {/* Expiring */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Expiring in 60 days</div>
              </div>
              {expiringSoon.length === 0 ? (
                <div className="note">No upcoming expiries.</div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Lot</th>
                        <th>Expiry</th>
                        <th>Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringSoon.map((x) => (
                        <tr key={(x._id || "") + (x.lotNumber || "")}>
                          <td>{x.itemName}</td>
                          <td className="mono">{x.lotNumber || "-"}</td>
                          <td>{fmtDate(x.expiryDate)}</td>
                          <td>{x.days}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
