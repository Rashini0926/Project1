import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../components/charts/BarChart";
import DonutChart from "../components/charts/DonutChart";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./SystemHome.css";

function SystemHome() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    inventoryItems: 0,
    deliveries: 0,
    suppliers: 0,
    returns: 0,
  });

  const [chartData, setChartData] = useState({
    ordersByMonth: [],
    deliveriesByMonth: [],
    returnsByMonth: [],
    breakdown: [],
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    sku: "", // ✅ required unique field
    type: "FinishedGood",
    description: "",
    category: "Clothing",
    size: "",
    color: "",
    quantity: 0,
    unit: "pcs",
    reorderLevel: 0,
    reorderQty: 0,
    location: "Main Warehouse",
    costPerUnit: 0,
    sellingPrice: 0,
    lotNumber: "",
    expiryDate: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stats");
        setStats({
          ...res.data.totals,
          returns:
            res.data.charts.breakdown.find((b) => b.label === "Returns")?.value ||
            0,
        });
        setChartData(res.data.charts);
      } catch (err) {
        console.error("Error fetching system stats", err);
      }
    };
    fetchStats();
  }, []);

  // ✅ Submit to Inventory
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/inventory", {
        ...form,
        quantity: Number(form.quantity),
        reorderLevel: Number(form.reorderLevel),
        reorderQty: Number(form.reorderQty),
        costPerUnit: Number(form.costPerUnit),
        sellingPrice: Number(form.sellingPrice),
      });

      alert("✅ Order added to Inventory!");
      setShowForm(false);
      setForm({
        itemName: "",
        sku: "",
        type: "FinishedGood",
        description: "",
        category: "Clothing",
        size: "",
        color: "",
        quantity: 0,
        unit: "pcs",
        reorderLevel: 0,
        reorderQty: 0,
        location: "Main Warehouse",
        costPerUnit: 0,
        sellingPrice: 0,
        lotNumber: "",
        expiryDate: "",
      });

      // Redirect to InventoryDashboard
      window.location.href = "/InventoryDashboard";
    } catch (err) {
      console.error("❌ Error placing order:", err.response?.data || err.message);
      alert("❌ Failed: " + (err.response?.data?.message || "Check console"));
    }
  };

  return (
    <div>
      <Header />

      {/* Stats */}
      <div className="stats-grid">
        <div className="card purple">
          <span className="emoji">📦</span>
          <p>Total Orders</p>
          <h2>{stats.totalOrders}</h2>
        </div>
        <div className="card teal">
          <span className="emoji">📊</span>
          <p>Inventory Items</p>
          <h2>{stats.inventoryItems}</h2>
        </div>
        <div className="card green">
          <span className="emoji">🚚</span>
          <p>Deliveries</p>
          <h2>{stats.deliveries}</h2>
        </div>
        <div className="card orange">
          <span className="emoji">🏭</span>
          <p>Suppliers</p>
          <h2>{stats.suppliers}</h2>
        </div>
        <div className="card red">
          <span className="emoji">🔄</span>
          <p>Returns</p>
          <h2>{stats.returns}</h2>
        </div>
      </div>

      {/* Button */}
      <div className="center-btn">
        <button className="order-btn" onClick={() => setShowForm(true)}>
          ➕ Add Inventory Order
        </button>
      </div>

      {/* Order Form */}
      {showForm && (
        <div className="form-overlay">
          <form className="order-form" onSubmit={handleSubmit}>
            <h3>📝 Add Inventory</h3>

            <div className="form-grid">
              <input
                type="text"
                placeholder="Item Name"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                required
                className="full"
              />

              {/* ✅ SKU field */}
              <input
                type="text"
                placeholder="SKU (Unique Code)"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                className="full"
              />

              {/* Type Selector */}
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="full"
              >
                <option value="FinishedGood">Finished Good</option>
                <option value="RawMaterial">Raw Material</option>
              </select>

              {/* Category Selector */}
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Clothing">Clothing</option>
                <option value="Fabric">Fabric</option>
                <option value="Thread">Thread</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Size"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
              />

              <input
                type="text"
                placeholder="Color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />

              <input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />

              {/* Unit Selector */}
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="m">m</option>
                <option value="rolls">rolls</option>
                <option value="box">box</option>
              </select>

              <input
                type="number"
                placeholder="Reorder Level"
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm({ ...form, reorderLevel: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Reorder Quantity"
                value={form.reorderQty}
                onChange={(e) =>
                  setForm({ ...form, reorderQty: e.target.value })
                }
              />

              {/* Location Selector */}
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="full"
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Showroom">Showroom</option>
                <option value="Storage Room">Storage Room</option>
                <option value="Delivery Van">Delivery Van</option>
              </select>

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="full"
              />

              <input
                type="number"
                placeholder="Cost Per Unit"
                value={form.costPerUnit}
                onChange={(e) =>
                  setForm({ ...form, costPerUnit: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Selling Price"
                value={form.sellingPrice}
                onChange={(e) =>
                  setForm({ ...form, sellingPrice: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Lot Number"
                value={form.lotNumber}
                onChange={(e) =>
                  setForm({ ...form, lotNumber: e.target.value })
                }
              />

              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
              />

              <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Charts */}
      <div className="reports-grid">
        <div className="card">
          <h3>📈 Monthly Overview</h3>
          <BarChart
            labels={chartData.ordersByMonth.map((d) => d.month)}
            orders={chartData.ordersByMonth.map((d) => d.value)}
            deliveries={chartData.deliveriesByMonth.map((d) => d.value)}
            returns={chartData.returnsByMonth.map((d) => d.value)}
          />
        </div>
        <div className="card">
          <h3>📊 System Breakdown</h3>
          <DonutChart
            labels={chartData.breakdown.map((d) => d.label)}
            values={chartData.breakdown.map((d) => d.value)}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SystemHome;
