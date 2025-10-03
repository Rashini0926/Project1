import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Header.css";

function Header() {
  const location = useLocation();

  // Map paths → titles
  const pageTitles = {
    "/system-home": "MAStock900 Dashboard",
    "/orders": "Order Management",
    "/inventorydashboard": "Inventory Dashboard",
    "/suppliers": "Supplier Management",
    "/deliveries": "Delivery Management",
    "/inventoryreports": "Reports Center",
    "/clothing-items": "Clothing Item Management",
  };

  // Fallback title if no match
  const title = pageTitles[location.pathname] || "Welcome";

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>{title}</h1>
      </div>

      <div className="header-center">
        <NavLink to="/orders" className={({ isActive }) => `header-link ${isActive ? "active" : ""}`}>Orders</NavLink>
        <NavLink to="/Inventorydashboard" className={({ isActive }) => `header-link ${isActive ? "active" : ""}`}>Inventory</NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `header-link ${isActive ? "active" : ""}`}>Deliveries</NavLink>
        <NavLink to="/Suppliers" className={({ isActive }) => `header-link ${isActive ? "active" : ""}`}>Suppliers</NavLink>
        <NavLink to="/Return" className={({ isActive }) => `header-link ${isActive ? "active" : ""}`}>Returns</NavLink>
      </div>

      <div className="header-right">
        <button className="header-btn">🔔</button>
        <div className="user-avatar">👤</div>
      </div>
    </header>
  );
}

export default Header;
