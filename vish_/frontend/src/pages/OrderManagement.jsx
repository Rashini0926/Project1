import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, deleteOrder } from '../services/orderService';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.orders || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await deleteOrder(id);
      fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Search filter
  const filteredOrders = orders.filter(order =>
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_Status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KPI stats
  const totalOrders = orders.length;
  const salesOrders = orders.filter(o => o.order_type === 'sales_Order').length;
  const purchaseOrders = orders.filter(o => o.order_type === 'purchase_Order').length;
  const pendingOrders = orders.filter(o => o.order_Status === 'CONFIRMED' || o.order_Status === 'PROCESSING').length;
  const deliveredOrders = orders.filter(o => o.order_Status === 'DELIVERED' || o.order_Status === 'SUCCESSFUL').length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600 mt-1">Monitor, track, and manage all orders in one place</p>
        </div>
        <Link 
          to="/orders/create" 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 flex items-center font-medium"
        >
          ➕ Create New Order
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { label: "Total Orders", value: totalOrders, color: "blue" },
          { label: "Sales Orders", value: salesOrders, color: "green" },
          { label: "Purchase Orders", value: purchaseOrders, color: "indigo" },
          { label: "Pending", value: pendingOrders, color: "yellow" },
          { label: "Delivered", value: deliveredOrders, color: "purple" },
        ].map((card, i) => (
          <div 
            key={i}
            className={`bg-white shadow-md rounded-xl p-5 border-l-4 border-${card.color}-600 transform transition duration-200 hover:scale-105 hover:shadow-xl hover:border-${card.color}-700`}
          >
            <p className="text-gray-500 text-sm">{card.label}</p>
            <h2 className="text-2xl font-bold text-gray-800">{card.value}</h2>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="mb-6 flex items-center justify-between">
        <input
          type="text"
          placeholder="🔍 Search by ID, customer, type, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg animate-pulse">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or create a new order.</p>
          <Link 
            to="/orders/create" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
          >
            ➕ Create First Order
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="flex justify-between p-4 border-b">
            <p className="text-gray-500 text-sm">Showing {filteredOrders.length} of {orders.length} orders</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.customer_Name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(order.order_Date)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.order_type === 'sales_Order' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.order_type === 'sales_Order' ? 'Sales' : 'Purchase'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.order_Status === 'CONFIRMED' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : order.order_Status === 'PROCESSING'
                        ? 'bg-blue-100 text-blue-800'
                        : order.order_Status === 'SUCCESSFUL'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.order_Status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${order.sub_Total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <Link 
                        to={`/orders/${order._id}`} 
                        className="px-3 py-1 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md text-xs"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/orders/edit/${order._id}`} 
                        className="px-3 py-1 rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md text-xs"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(order._id)} 
                        className="px-3 py-1 rounded-lg text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-md text-xs"
                      >
                        Delete
                      </button>
                    </div>
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

export default OrderManagement;
