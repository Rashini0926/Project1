import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import './Supplier.css';
import { Link } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

  const URL = "http://localhost:5000/suppliers"; // backend API

function Supplier({ searchQuery, setSearchQuery, handleSearch }) {

  const [suppliers, setSuppliers] = useState([]);

  // ✅ Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(URL);
        setSuppliers(res.data.suppliers || []); // ensure array
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  // ✅ Calculate dashboard stats
  const totalSuppliers = suppliers.length;
  const activeCount = suppliers.filter(
    (s) => s.Status.toLowerCase() === "active"
  ).length;
  const inactiveCount = suppliers.filter(
    (s) => s.Status.toLowerCase() === "inactive"
  ).length;

  // ✅ Prepare chart data
  const statusData = [
    { name: "Active", value: activeCount },
    { name: "Inactive", value: inactiveCount },
  ];

  const materialCount = suppliers.reduce((acc, supplier) => {
    const material = supplier.Material || "Unknown";
    acc[material] = (acc[material] || 0) + 1;
    return acc;
  }, {});
  const materialData = Object.entries(materialCount).map(([name, value]) => ({
    name,
    value,
  }));

  const STATUS_COLORS = {
    active: "#28a745",
    inactive: "#dc3545",
    preferred: "#ffc107",
    blacklisted: "#6c757d",
  };

  const COLORS = ["#28a745", "#dc3545", "#007bff", "#ffc107"];
  

  return (
    <div>
      <Nav />
      <div class="page-container">
        <h1 class="page-title">Suppliers</h1>

        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e)=> setSearchQuery(e.target.value)}
          ></input>
          <button onClick={handleSearch} class="btn">Search</button>
          <button class="btn"><Link to="/getAll" className="active home-a">Get All Suppliers</Link></button>
          <button class="btn add-btn"><Link to="/add" className="active home-a">+ Add Supplier</Link></button>
        </div>

        {/* 📊 Dashboard Section */}
        <div className="dashboard-container">
          <div className="stat-card" style={{ borderTop: "4px solid #ec1c24" }}>
            <h2>{totalSuppliers}</h2>
            <p>Total Suppliers</p>
          </div>
          <div
            className="stat-card"
            style={{ borderTop: "4px solid #28a745" }}
          >
            <h2>{activeCount}</h2>
            <p>Active Suppliers</p>
          </div>
          <div
            className="stat-card"
            style={{ borderTop: "4px solid #dc3545" }}
          >
            <h2>{inactiveCount}</h2>
            <p>Inactive Suppliers</p>
          </div>
        </div>

        {/* 📈 Charts Section */}
        <div className="charts-container">
          {/* Status Pie Chart */}
          <div className="chart-box">
            <h3>Supplier Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  isAnimationActive={true}       // ✅ Enable animation
                  animationDuration={1200}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name.toLowerCase()]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Materials Bar Chart */}
          <div className="chart-box">
            <h3>Materials Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={materialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#007bff" isAnimationActive={true} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default Supplier;
