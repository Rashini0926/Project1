import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../Nav/Nav";
import "./pr.css";

const PR_API = "http://localhost:5000/purchase-requisitions";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? String(d) : dt.toISOString().slice(0, 10);
}
function money(n) {
  const v = Number(n || 0);
  try {
    return v.toLocaleString("en-LK", { style: "currency", currency: "LKR" });
  } catch {
    return `LKR ${v.toFixed(2)}`;
  }
}

export default function PRView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${PR_API}/${id}`);
      setDoc(data?.data || null);
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [id]);

  const doAction = async (action) => {
    try {
      if (action === "receive") {
        if (!window.confirm("Receive all lines on this PR?")) return;
      }
      await axios.post(`${PR_API}/${id}/${action}`);
      await load();
      alert(`✅ ${action} OK`);
    } catch (e) {
      alert(`⚠️ ${e?.response?.data?.message || e.message}`);
    }
  };

  return (
    <div className="inventory-container">
      <Nav />

      <div className="pr-header">
        <div>
          <div className="eyebrow">PR Detail</div>
          <h1 className="title">{doc?.prNumber || "Requisition"}</h1>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => navigate("/Requisitions")}>Back</button>
          {(doc?.status === "Draft") && <button className="btn outline" onClick={() => doAction("submit")}>Submit</button>}
          {(doc?.status === "Submitted") && <button className="btn outline" onClick={() => doAction("approve")}>Approve</button>}
          {(doc?.status === "Approved") && <button className="btn outline" onClick={() => doAction("order")}>Mark Ordered</button>}
          {(doc?.status === "Ordered" || doc?.status === "PartiallyReceived") &&
            <button className="btn primary" onClick={() => doAction("receive")}>Receive All</button>}
        </div>
      </div>

      {loading && <div className="skeleton">Loading…</div>}
      {err && <div className="error-text">Error: {err}</div>}
      {!loading && doc && (
        <>
          <div className="panel">
            <div className="panel-head">
              <h3>Summary</h3>
              <div className="meta">
                <span className={`pill ${doc.status}`}>{doc.status}</span>
              </div>
            </div>
            <div className="summary-grid">
              <div><div className="k">PR #</div><div className="v mono">{doc.prNumber}</div></div>
              <div><div className="k">Expected</div><div className="v">{fmtDate(doc.expectedDate)}</div></div>
              <div><div className="k">Created</div><div className="v">{fmtDate(doc.createdAt)}</div></div>
              <div><div className="k">Subtotal</div><div className="v mono">{money(doc.subtotal)}</div></div>
              <div><div className="k">Tax</div><div className="v mono">{money(doc.tax)}</div></div>
              <div><div className="k">Total</div><div className="v mono">{money(doc.total)}</div></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Lines</h3>
              <div className="meta">{doc.lines?.length || 0} items</div>
            </div>
            <div className="lines-table-wrap">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Item</th>
                    <th>UoM</th>
                    <th className="right">Qty</th>
                    <th className="right">Unit Cost</th>
                    <th className="right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(doc.lines || []).map((l, i) => (
                    <tr key={i}>
                      <td className="mono">{l.sku}</td>
                      <td>{l.itemName}</td>
                      <td>{l.uom}</td>
                      <td className="right">{l.qty}</td>
                      <td className="right mono">{money(l.unitCost)}</td>
                      <td className="right mono">{money(l.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {doc.notes && <div className="notes">Notes: {doc.notes}</div>}
          </div>
        </>
      )}
    </div>
  );
}
