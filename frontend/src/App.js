import React from "react";
import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Components
import Supplier from "./components/Supplier/Supplier";
import Delivery from "./components/Delivery/DELIVERY/delivery";
import AddDelivery from "./components/AddDelivery/AddDelivery";
import UpdateDelivery from "./components/UpdateDelivery/UpdateDelivery";
import MapTracker from "./components/MapTracker";
import DeliveryDashboard from "./components/Delivery/Dashboard/DeliveryDashboard";
import Drivers from "./components/Drivers/Drivers";
import AddDriver from "./components/Drivers/AddDriver";
import UpdateDriver from "./components/Drivers/UpdateDriver";
import Return from "./components/Return/Return";
import AddReturn from "./components/AddReturn/AddReturn";
import UpdateReturn from "./components/UpdateReturn/UpdateReturn";
import InsertReturn from "./components/InsertReturn/InsertReturn";
import Home from "./components/Home/Home";
import SystemHome from "./pages/SystemHome";
import MainHome from "./pages/MainHome/MainHome";
import InventoryDashboard from "./components/InventoryDashboard/InventoryDashboard";
import InventoryOrders from "./components/InventoryOrders/InventoryOrder";
import InventoryReports from "./components/InventoryReports/InventoryReport";
import InventorySuppliers from "./components/InventorySuppliers/InventorySupplier";
import InventoryTable from "./components/InventoryTable/InventoryTable";
import AddInventory from "./components/InventoryDashboard/AddInventory";
import UpdateInventory from "./components/InventoryDashboard/UpdateInventory";
import PRList from "./components/Requisitions/PRList";
import PRCreate from "./components/Requisitions/PRCreate";
import PRView from "./components/Requisitions/PRView";
import GetSuppliers from "./components/GetSuppliers/GetSuppliers";
import AddSupplier from "./components/AddSupplier/AddSupplier";
import UpdateSupplier from "./components/UpdateSupplier/UpdateSupplier";

import OrderManagement from "./pages/OrderManagement";
import CreateOrderForm from "./pages/CreateOrderForm";
import EditOrderForm from "./pages/EditOrderForm";
import OrderDetails from "./pages/OrderDetails";
import ClothingItemManagement from "./pages/ClothingItemManagement";
import ClothingItemForm from "./pages/ClothingItemForm";
import ClothingItemDetails from "./pages/ClothingItemDetails";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ViewDelivery from "./components/Delivery/ViewDelivery";

function App() {
  const location = useLocation();

// Determine if sidebar should be hidden
// Only show sidebar for inventory routes
const hideSidebar = !location.pathname.startsWith("/Inventory");


  return (
    <div className="app-container" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      {!hideSidebar && (
        <aside className="sidebar" style={{ width: "250px" }}>
          <Home />
        </aside>
      )}

      {/* Main content */}
      <main className="content" style={{ flex: 1, padding: "20px" }}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />

          {/* System home */}
          <Route path="/system-home" element={<SystemHome />} />

          {/* Main home */}
          <Route path="/mainhome" element={<MainHome />} />

          {/* Inventory module */}
          <Route path="/InventoryDashboard" element={<InventoryDashboard />} />
          <Route path="/InventoryOrders" element={<InventoryOrders />} />
          <Route path="/InventoryReports" element={<InventoryReports />} />
          <Route path="/InventorySuppliers" element={<InventorySuppliers />} />
          <Route path="/InventoryTable" element={<InventoryTable />} />
          <Route path="/InventoryAdd" element={<AddInventory />} />
          <Route path="/UpdateInventory/:id" element={<UpdateInventory />} />
          <Route path="/Requisitions" element={<PRList />} />
          <Route path="/Requisitions/new" element={<PRCreate />} />
          <Route path="/Requisitions/:id" element={<PRView />} />

          {/* Supplier routes */}
          <Route path="/getAll" element={<GetSuppliers />} />
          <Route path="/add" element={<AddSupplier />} />
          <Route path="/update/:Id" element={<UpdateSupplier />} />
          <Route path="/Suppliers" element={<Supplier />} />

          {/* Order routes */}
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/orders/create" element={<CreateOrderForm />} />
          <Route path="/orders/edit/:id" element={<EditOrderForm />} />
          <Route path="/orders/:id" element={<OrderDetails />} />

          {/* Clothing items */}
          <Route path="/clothing-items" element={<ClothingItemManagement />} />
          <Route path="/clothing-items/create" element={<ClothingItemForm />} />
          <Route path="/clothing-items/edit/:id" element={<ClothingItemForm />} />
          <Route path="/clothing-items/:id" element={<ClothingItemDetails />} />

          {/* Returns */}
          <Route path="/Return" element={<Return />} />
          <Route path="/addreturn" element={<InsertReturn />} />
          <Route path="/viewreturn/:id" element={<AddReturn />} />
          <Route path="/updatereturn/:id" element={<UpdateReturn />} />

          {/* Delivery */}
          <Route path="/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/delivery/add" element={<AddDelivery />} />
          <Route path="/delivery/:id/edit" element={<UpdateDelivery />} />
          <Route path="/delivery/:deliveryId/tracking" element={<MapTracker />} />
          <Route path="/deliveries/view/:id" element={<ViewDelivery />} />

          {/* Drivers */}
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/drivers/add" element={<AddDriver />} />
          <Route path="/drivers/:id/edit" element={<UpdateDriver />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
