import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrder } from '../services/orderService';
import { getAllClothingItems } from '../services/clothingItemService';

function EditOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clothingItems, setClothingItems] = useState([]);
  const [loadingClothingItems, setLoadingClothingItems] = useState(true);
  const [formData, setFormData] = useState({
    order_id: '',
    order_Date: '',
    customer_Name: '',
    order_type: 'sales_Order',
    email: '',
    contact_No: '',
    order_Status: 'CONFIRMED',
    description: '',
    sub_Total: 0,
    order_Items: [],
    delivery_Address: {
      street: '',
      city: '',
      district: ''
    }
  });

  // Fetch order data when component mounts
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id);
        const orderData = response.order;
        
        // Format date for input date field (YYYY-MM-DD)
        const formattedDate = new Date(orderData.order_Date)
          .toISOString()
          .split('T')[0];
        
        setFormData({
          ...orderData,
          order_Date: formattedDate
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Fetch clothing items
  useEffect(() => {
    const fetchClothingItems = async () => {
      try {
        setLoadingClothingItems(true);
        const response = await getAllClothingItems();
        if (response.success && response.data) {
          setClothingItems(response.data);
        } else {
          console.error('Failed to load clothing items');
        }
      } catch (err) {
        console.error('Error fetching clothing items:', err);
      } finally {
        setLoadingClothingItems(false);
      }
    };

    fetchClothingItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested delivery_Address fields
    if (name.startsWith('delivery_')) {
      const field = name.replace('delivery_', '');
      setFormData({
        ...formData,
        delivery_Address: {
          ...formData.delivery_Address,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.order_Items];
    
    // If the field is product_Name and we're selecting from dropdown
    if (field === 'product_Name') {
      // Find the selected clothing item
      const selectedItem = clothingItems.find(item => item.name === value);
      
      // If an item was found, update its price automatically
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value,
          price: selectedItem.price
        };
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'quantity' || field === 'price' ? Number(value) : value
      };
    }
    
    // Recalculate subtotal whenever items change
    const subTotal = updatedItems.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
    
    setFormData({
      ...formData,
      order_Items: updatedItems,
      sub_Total: subTotal
    });
  };

  const addOrderItem = () => {
    // Default to the first clothing item in the list if available
    const defaultItem = clothingItems.length > 0 ? clothingItems[0] : null;
    
    setFormData({
      ...formData,
      order_Items: [
        ...formData.order_Items, 
        { 
          product_Name: defaultItem ? defaultItem.name : '', 
          quantity: 1, 
          price: defaultItem ? defaultItem.price : 0 
        }
      ]
    });
  };

  const removeOrderItem = (index) => {
    if (formData.order_Items.length > 1) {
      const updatedItems = formData.order_Items.filter((_, i) => i !== index);
      
      // Recalculate subtotal after removing item
      const subTotal = updatedItems.reduce((total, item) => {
        return total + (item.quantity * item.price);
      }, 0);
      
      setFormData({
        ...formData,
        order_Items: updatedItems,
        sub_Total: subTotal
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateOrder(id, formData);
      navigate('/orders'); // Redirect to order list page after successful update
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.order_id) return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-center items-center flex-col">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mb-4"></div>
        <p className="text-lg text-gray-600">Loading order data...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Order</h1>
          <p className="text-gray-600 mt-1">Modify the order details below</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-6">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800">Order Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order ID - Read only in edit mode */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="order_id">
                Order ID
              </label>
              <div className="flex">
                <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                  </svg>
                  ID
                </div>
                <input
                  className="rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  id="order_id"
                  name="order_id"
                  type="text"
                  value={formData.order_id}
                  readOnly
                />
              </div>
            </div>

            {/* Order Date */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="order_Date">
                Order Date
              </label>
              <div className="flex">
                <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  id="order_Date"
                  name="order_Date"
                  type="date"
                  value={formData.order_Date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Customer Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="customer_Name">
                Customer Name
              </label>
              <div className="flex">
                <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="rounded-r-lg border bg-gray-50  border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  id="customer_Name"
                  name="customer_Name"
                  type="text"
                  value={formData.customer_Name}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>
            </div>

            {/* Order Type */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="order_type">
                Order Type
              </label>
              <div className="flex">
                <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <select
                  className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  id="order_type"
                  name="order_type"
                  value={formData.order_type}
                  onChange={handleChange}
                  required
                >
                  <option value="sales_Order">Sales Order</option>
                  <option value="purchase_Order">Purchase Order</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <div className="flex">
                <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="contact_No">
                Contact Number
              </label>
              <div className="flex">
                <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  id="contact_No"
                  name="contact_No"
                  type="text"
                  value={formData.contact_No}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Order Status */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="order_Status">
                Order Status
              </label>
              <div className="flex">
                <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <select
                  className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  id="order_Status"
                  name="order_Status"
                  value={formData.order_Status}
                  onChange={handleChange}
                  required
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SUCCESSFUL">SUCCESSFUL</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4 md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                Description (Optional)
              </label>
              <textarea
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 block w-full p-2.5"
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows="3"
                placeholder="Enter any additional information about this order"
              />
            </div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-semibold text-blue-800">Delivery Address</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="delivery_street">
                  Street
                </label>
                <div className="flex">
                  <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                    id="delivery_street"
                    name="delivery_street"
                    type="text"
                    placeholder="123 Main St"
                    value={formData.delivery_Address.street}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="delivery_city">
                  City
                </label>
                <div className="flex">
                  <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <input
                    className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                    id="delivery_city"
                    name="delivery_city"
                    type="text"
                    placeholder="City name"
                    value={formData.delivery_Address.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="delivery_district">
                  District
                </label>
                <div className="flex">
                  <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <input
                    className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                    id="delivery_district"
                    name="delivery_district"
                    type="text"
                    placeholder="District"
                    value={formData.delivery_Address.district}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Card */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <h2 className="text-xl font-semibold text-blue-800">Order Items</h2>
            </div>
            <button
              type="button"
              onClick={addOrderItem}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Item
            </button>
          </div>
          
          {/* Available Clothing Items */}
          <div className="px-6 pt-6">
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  Available Clothing Items
                </h3>
                <div className="text-sm text-blue-600 font-medium flex items-center">
                  <span>Click item to select or</span>
                  <div className="relative ml-2 inline-block">
                    <div className="group">
                      <button type="button" className="text-blue-700 hover:text-blue-900 font-semibold underline flex items-center">
                        Add New Item +
                      </button>
                      <div className="absolute z-10 right-0 mt-2 hidden group-hover:block">
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-48">
                          <p className="text-xs text-gray-600 mb-2">Add new item with:</p>
                          {clothingItems.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              className="block w-full text-left px-2 py-1 text-sm hover:bg-blue-50 rounded"
                              onClick={() => {
                                // Add a new order item with this product
                                const updatedItems = [
                                  ...formData.order_Items,
                                  { product_Name: item.name, quantity: 1, price: item.price }
                                ];
                                
                                const subTotal = updatedItems.reduce((total, item) => {
                                  return total + (item.quantity * item.price);
                                }, 0);
                                
                                setFormData({
                                  ...formData,
                                  order_Items: updatedItems,
                                  sub_Total: subTotal
                                });
                              }}
                            >
                              {item.name} - ${item.price.toFixed(2)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {clothingItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`bg-white p-3 rounded border ${
                      formData.order_Items.length > 0 && formData.order_Items[0].product_Name === item.name
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                    } transition-all duration-200 flex flex-col items-center text-center cursor-pointer`}
                    onClick={() => {
                      // If there are any existing items in the order, update the first one
                      if (formData.order_Items.length > 0) {
                        handleItemChange(0, 'product_Name', item.name);
                        
                        // Show a brief visual feedback
                        const el = document.activeElement;
                        if (el) el.blur();
                      }
                    }}
                  >
                    <span className="text-sm font-medium mb-1">{item.name}</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">${item.price.toFixed(2)}</span>
                    {formData.order_Items.length > 0 && formData.order_Items[0].product_Name === item.name && (
                      <span className="mt-2 text-xs text-green-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {formData.order_Items.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No items added yet. Click "Add Item" to add your first item.
              </div>
            ) : (
              formData.order_Items.map((item, index) => (
                <div key={index} className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition duration-150">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center bg-blue-100 rounded-full h-8 w-8 text-blue-600 font-medium mr-2">
                        {index + 1}
                      </div>
                      <h3 className="font-medium text-gray-800">Item #{index + 1}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      className="text-red-500 hover:text-red-700 flex items-center transition duration-150"
                      disabled={formData.order_Items.length === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formData.order_Items.length === 1 ? (
                        <span className="text-sm text-gray-400">Cannot remove (minimum 1 item)</span>
                      ) : (
                        <span className="text-sm">Remove</span>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Product Name
                      </label>
                      <div className="flex">
                        <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <select
                          className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                          value={item.product_Name}
                          onChange={(e) => handleItemChange(index, 'product_Name', e.target.value)}
                          required
                        >
                          {clothingItems.map(clothing => (
                            <option key={clothing.id} value={clothing.name}>
                              {clothing.name} - ${clothing.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Size
                      </label>
                      <div className="flex">
                        <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                          </svg>
                        </div>
                        <select
                          className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                          value={item.size || ''}
                          onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                          required
                        >
                          <option value="">Select Size</option>
                          {clothingItems
                            .find(clothing => clothing.name === item.product_Name)?.sizes?.map(size => (
                              <option key={size} value={size}>{size}</option>
                            )) || ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Color
                      </label>
                      <div className="flex">
                        <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <select
                          className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                          value={item.color || ''}
                          onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                          required
                        >
                          <option value="">Select Color</option>
                          {clothingItems
                            .find(clothing => clothing.name === item.product_Name)?.colors?.map(color => (
                              <option key={color} value={color}>{color}</option>
                            )) || ['Black', 'White', 'Blue', 'Red', 'Green'].map(color => (
                              <option key={color} value={color}>{color}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Quantity
                      </label>
                      <div className="flex">
                        <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          className="rounded-r-lg border border-gray-300 text-gray-900 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                          type="number"
                          min="1"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Price
                      </label>
                      <div className="flex">
                        <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          className="rounded-r-lg border border-gray-300 text-gray-900 bg-gray-50 block flex-1 min-w-0 w-full text-sm p-2.5"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.price}
                          readOnly
                          required
                        />
                        <div className="absolute right-0 flex items-center pr-14">
                          <span className="text-xs text-blue-600 font-medium">Auto-calculated</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                    <div className="bg-blue-50 py-1 px-3 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">
                        Item Total: ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-semibold text-blue-800">Order Summary</h2>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-lg font-medium">${formData.sub_Total.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 my-3"></div>
              
              <div className="flex justify-between items-center text-blue-800">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-xl">${formData.sub_Total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-end mt-6 gap-3">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Update Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditOrderForm;
