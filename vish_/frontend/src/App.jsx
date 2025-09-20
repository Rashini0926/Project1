import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import OrderManagement from './pages/OrderManagement';
import CreateOrderForm from './pages/CreateOrderForm';
import EditOrderForm from './pages/EditOrderForm';
import OrderDetails from './pages/OrderDetails';
import ClothingItemManagement from './pages/ClothingItemManagement';
import ClothingItemForm from './pages/ClothingItemForm';
import ClothingItemDetails from './pages/ClothingItemDetails';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<OrderManagement />} />
      <Route path="/orders" element={<OrderManagement />} />
      <Route path="/orders/create" element={<CreateOrderForm />} />
      <Route path="/orders/edit/:id" element={<EditOrderForm />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      
      {/* Clothing Item Routes */}
      <Route path="/clothing-items" element={<ClothingItemManagement />} />
      <Route path="/clothing-items/create" element={<ClothingItemForm />} />
      <Route path="/clothing-items/edit/:id" element={<ClothingItemForm />} />
      <Route path="/clothing-items/:id" element={<ClothingItemDetails />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-20 pb-10 bg-gray-50">
          <AppRoutes />
        </main>
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4">
            <p className="text-center">&copy; 2025 Order Management System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
