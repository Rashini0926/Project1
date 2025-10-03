import { logout, getCurrentUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome {user?.role}</p>
      <nav>
        <a href="/inventory">Inventory</a> |{" "}
        <a href="/suppliers">Suppliers</a> |{" "}
        <a href="/orders">Orders</a> |{" "}
        <a href="/purchase-requisitions">Purchase Requisitions</a>
      </nav>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

