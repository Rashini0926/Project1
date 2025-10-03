// src/components/Nav/Nav.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom"; // 👈 use Outlet for nested routes
import "./nav.css";

function Nav() {
  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          MAStock900
        </div>
        <ul className="nav-links">
          <li>
            <NavLink
              to="/InventoryDashboard"
              className={({ isActive }) => `home-a ${isActive ? "active" : ""}`}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/InventoryTable"
              className={({ isActive }) => `home-a ${isActive ? "active" : ""}`}
            >
              Raw Materials &amp; Finished Goods
            </NavLink>

            <NavLink
              to="/requisitions"
              className={({ isActive }) => `home-a ${isActive ? "active" : ""}`}
            >
              Purchase Requisitions
            </NavLink>

            <NavLink
              to="/requisitions/new"
              className={({ isActive }) => `home-a ${isActive ? "active" : ""}`}
            >
              + New PR
            </NavLink>

            <NavLink
              to="/system-home"
              className={({ isActive }) => `home-a ${isActive ? "active" : ""}`}
            >
              Back to Main Dashboard
            </NavLink>
          </li>
        </ul>
      </nav>

    </div>
  );
}

export default Nav;
