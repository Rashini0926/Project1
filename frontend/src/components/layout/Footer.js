import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} Cinnex Management System. All rights reserved.</p>
      <div className="footer-links">
        <a href="/system-home">Home</a>
        <a href="/orders">Orders</a>
        <a href="/inventorydashboard">Inventory</a>
        <a href="/suppliers">Suppliers</a>
        <a href="/inventoryreports">Reports</a>
      </div>
    </footer>
  );
}

export default Footer;
