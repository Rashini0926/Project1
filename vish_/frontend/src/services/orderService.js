// API service for orders
const API_BASE = 'http://localhost:5000/api/orders';

/**
 * Fetches all orders from the API
 * @returns {Promise<Object>} - Object containing orders array
 */
export async function getOrders() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch orders');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Creates a new order
 * @param {Object} order - The order data
 * @returns {Promise<Object>} - The created order data
 */
export async function addOrder(order) {
  try {
    // Calculate subtotal based on order items if not provided
    if (!order.sub_Total && order.order_Items && order.order_Items.length > 0) {
      order.sub_Total = order.order_Items.reduce((total, item) => {
        return total + (item.quantity * item.price);
      }, 0);
    }

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add order');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

/**
 * Gets order details by ID
 * @param {string} id - The order ID
 * @returns {Promise<Object>} - The order data
 */
export async function getOrderById(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch order');
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
}

/**
 * Updates an order
 * @param {string} id - The order ID
 * @param {Object} order - The updated order data
 * @returns {Promise<Object>} - The updated order
 */
export async function updateOrder(id, order) {
  try {
    // Ensure subtotal is calculated based on current items
    if (order.order_Items && order.order_Items.length > 0) {
      order.sub_Total = order.order_Items.reduce((total, item) => {
        return total + (item.quantity * item.price);
      }, 0);
    }

    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update order');
    }
    
    return res.json();
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes an order
 * @param {string} id - The order ID
 * @returns {Promise<Object>} - Confirmation of deletion
 */
export async function deleteOrder(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete order');
    }
    
    return res.json();
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
}
