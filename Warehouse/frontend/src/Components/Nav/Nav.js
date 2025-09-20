import React from "react";
import './Nav.css';
import { Link } from "react-router-dom";

function Nav() {
  return (
    <div>
      <div class="header">
        <div class="logo">MAStock900</div>
        <div class="user-box">User</div>
      </div>

      <nav class="navbar">
        <ul>
          <li>
            <Link to="/mainhome" className="active home-a">
            DASHBOARD
            </Link>
          </li>
          <li>INVENTORY</li>
          <li>ORDERS</li>
          <li><Link to="/mainhome" className="active home-a">SUPPLIERS</Link></li>
          <li>DELIVERY</li>
          <li>HANDLING</li>
        </ul>
      </nav>
    </div>
  );
}

export default Nav;
