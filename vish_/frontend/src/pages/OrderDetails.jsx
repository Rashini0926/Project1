import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id);
        setOrder(response.order);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 📄 Export to PDF function
  const exportToPDF = () => {
    if (!order) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Order Details', 14, 20);

    // Order info
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.order_id}`, 14, 30);
    doc.text(`Date: ${formatDate(order.order_Date)}`, 14, 38);
    doc.text(`Type: ${order.order_type === 'sales_Order' ? 'Sales Order' : 'Purchase Order'}`, 14, 46);
    doc.text(`Status: ${order.order_Status}`, 14, 54);

    // Customer info
    doc.text(`Customer: ${order.customer_Name}`, 14, 70);
    doc.text(`Email: ${order.email}`, 14, 78);
    doc.text(`Contact: ${order.contact_No}`, 14, 86);
    if (order.delivery_Address) {
      doc.text(
        `Address: ${order.delivery_Address.street}, ${order.delivery_Address.city}, ${order.delivery_Address.district}`,
        14,
        94
      );
    }

    // Items table
    const tableColumn = ["#", "Product", "Size", "Color", "Qty", "Price", "Total"];
    const tableRows = [];

    order.order_Items.forEach((item, index) => {
      tableRows.push([
        index + 1,
        item.product_Name,
        item.size || "-",
        item.color || "-",
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.quantity * item.price).toFixed(2)}`
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
    });

    // Totals
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${order.sub_Total.toFixed(2)}`, 14, finalY);
    if (order.tax > 0) {
      finalY += 8;
      doc.text(`Tax: $${order.tax.toFixed(2)}`, 14, finalY);
    }
    if (order.discount > 0) {
      finalY += 8;
      doc.text(`Discount: -$${order.discount.toFixed(2)}`, 14, finalY);
    }
    finalY += 8;
    doc.text(
      `Grand Total: $${order.grand_Total ? order.grand_Total.toFixed(2) : order.sub_Total.toFixed(2)}`,
      14,
      finalY
    );

    // Save PDF
    doc.save(`Order_${order.order_id}.pdf`);
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-center items-center flex-col">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mb-4"></div>
        <p className="text-lg text-gray-600">Loading order details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
        <div className="flex items-center">
          <p className="font-medium">{error}</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
      >
        ⬅️ Back to Orders
      </button>
    </div>
  );

  if (!order) return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
        <div className="flex items-center">
          <p className="font-medium">Order not found.</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
      >
        ⬅️ Back to Orders
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            Order Details
            <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
          </h1>
          <p className="text-gray-600 mt-1">Viewing order {order.order_id}</p>
        </div>
        <div className="flex space-x-3">
          {/* 🆕 Export to PDF button */}
          <button
            onClick={exportToPDF}
            className="flex items-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            📄 Export to PDF
          </button>

          <button
            onClick={() => navigate(`/orders/edit/${order._id}`)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            ⬅️ Back to Orders
          </button>
        </div>
      </div>

      {/* Order Information Card */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-8">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800">Order Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Details Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Order Details</h3>
              <dl className="space-y-3">
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Order ID:</dt>
                  <dd className="text-sm font-semibold text-gray-900">{order.order_id}</dd>
                </div>
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Date:</dt>
                  <dd className="text-sm text-gray-900">{formatDate(order.order_Date)}</dd>
                </div>
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Type:</dt>
                  <dd>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.order_type === 'sales_Order' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.order_type === 'sales_Order' ? 'Sales Order' : 'Purchase Order'}
                    </span>
                  </dd>
                </div>
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Status:</dt>
                  <dd>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                  </dd>
                </div>
              </dl>
            </div>

            {/* Customer Information Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Customer Information</h3>
              <dl className="space-y-3">
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Name:</dt>
                  <dd className="text-sm font-semibold text-gray-900">{order.customer_Name}</dd>
                </div>
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Email:</dt>
                  <dd className="text-sm text-gray-900">{order.email}</dd>
                </div>
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Contact:</dt>
                  <dd className="text-sm text-gray-900">{order.contact_No}</dd>
                </div>
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Address:</dt>
                  <dd className="text-sm text-gray-900">
                    {order.delivery_Address.street}, {order.delivery_Address.city}, {order.delivery_Address.district}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Description Section (Conditional) */}
          {order.description && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Description</h3>
              <p className="text-gray-700">{order.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items Card */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-8">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800">Order Items</h2>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.order_Items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product_Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.size ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.size}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.color ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {item.color}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan="4" className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Subtotal:</td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">${order.sub_Total.toFixed(2)}</td>
                </tr>
                {order.tax > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="4" className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Tax:</td>
                    <td className="px-6 py-3 text-sm font-bold text-gray-900">${order.tax.toFixed(2)}</td>
                  </tr>
                )}
                {order.discount > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="4" className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Discount:</td>
                    <td className="px-6 py-3 text-sm font-bold text-gray-900">-${order.discount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="bg-blue-50">
                  <td colSpan="4" className="px-6 py-3 text-right text-sm font-bold text-blue-800">Total:</td>
                  <td className="px-6 py-3 text-sm font-bold text-blue-800">${order.grand_Total ? order.grand_Total.toFixed(2) : order.sub_Total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
