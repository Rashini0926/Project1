import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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

export default function PRList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState(""); // all
  const [q, setQ] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { data } = await axios.get(PR_API, { params: { status, q } });
      setRows(Array.isArray(data?.data) ? data.data : []);
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // initial
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [status, q]);

  const filtered = useMemo(() => rows, [rows]);

  const quick = async (id, action) => {
    try {
      if (!id) return;
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
          <div className="eyebrow">Procurement</div>
          <h1 className="title">Purchase Requisitions</h1>
        </div>
        <div className="actions">
          <button className="btn outline" onClick={load}>Refresh</button>
          <button className="btn primary" onClick={() => navigate("/Requisitions/new")}>+ New Requisition</button>
        </div>
      </div>

      <div className="pr-toolbar">
        <div className="search">
          <span className="search-ic">🔎</span>
          <input
            placeholder="Search PR #, SKU, item, notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option>Draft</option>
          <option>Submitted</option>
          <option>Approved</option>
          <option>Ordered</option>
          <option>PartiallyReceived</option>
          <option>Received</option>
          <option>Cancelled</option>
        </select>
      </div>

      {loading && <div className="skeleton">Loading…</div>}
      {err && <div className="error-text">Error: {err}</div>}

      {!loading && !err && (
        <div className="table-wrap">
          <table className="wms-table">
            <thead>
              <tr>
                <th>PR #</th>
                <th>Status</th>
                <th>Lines</th>
                <th>Supplier</th>
                <th className="right">Subtotal</th>
                <th className="right">Total</th>
                <th>Expected</th>
                <th>Created</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className="empty-cell" colSpan={8}>No requisitions found</td></tr>
              ) : filtered.map((r) => (
                <tr key={r._id}>
                  <td><Link className="link" to={`/Requisitions/${r._id}`}>{r.prNumber || "—"}</Link></td>
                  <td><span className={`pill ${r.status}`}>{r.status}</span></td>
                  <td>{Array.isArray(r.lines) ? r.lines.length : 0}</td>
                  <td>{r.supplier?.Name || r.supplier || "—"}</td>
                  <td className="right">{money(r.subtotal)}</td>
                  <td className="right">{money(r.total)}</td>
                  <td>{fmtDate(r.expectedDate)}</td>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td className="right">
                    <Link className="btn tiny ghost" to={`/Requisitions/${r._id}`}>Open</Link>
                    {r.status === "Draft" && (
                      <button className="btn tiny outline" onClick={() => quick(r._id, "submit")}>Submit</button>
                    )}
                    {r.status === "Submitted" && (
                      <button className="btn tiny outline" onClick={() => quick(r._id, "approve")}>Approve</button>
                    )}
                    {r.status === "Approved" && (
                      <button className="btn tiny outline" onClick={() => quick(r._id, "order")}>Order</button>
                    )}
                    {(r.status === "Ordered" || r.status === "PartiallyReceived") && (
                      <button className="btn tiny primary" onClick={() => quick(r._id, "receive")}>Receive</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
