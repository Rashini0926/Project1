// Controler/orderControler.js
import mongoose from "mongoose";
import Order from "../Model/orderModel.js";

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });
    // return empty array with 200 (better for clients)
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const addOrder = async (req, res) => {
  try {
    // Find the last order to get the highest order_id
    const lastOrder = await Order.findOne().sort({ order_id: -1 });
    
    let newOrderId = 'ORD-1000'; // Default starting point
    
    if (lastOrder) {
      // Extract the numeric part of the last order ID
      const lastOrderIdNum = parseInt(lastOrder.order_id.split('-')[1]);
      // Increment for new order ID
      newOrderId = `ORD-${lastOrderIdNum + 1}`;
    }
    
    // Set the new order_id in the request body
    const orderData = {
      ...req.body,
      order_id: newOrderId
    };
    
    const newOrder = await Order.create(orderData);
    return res.status(201).json({ newOrder });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Unable to add order", error: err.message });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid _id format" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "No order found" });
    return res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/orders/:id  (update by Mongo _id)
const updateorder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid _id format" });
  }

  try {
    const updated = await Order.findByIdAndUpdate(id, req.body, {
      new: true,             // return the updated doc
      runValidators: true,   // validate against schema
    });

    if (!updated) {
      return res.status(404).json({ message: "Unable To Update order Details" });
    }

    return res.status(200).json({ order: updated });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// (optional) DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid _id format" });
  }

  try {
    const removed = await Order.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: "Order not found" });
    return res.json({ message: "Order deleted", _id: removed._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Export as default for ESM
export default { getAllOrders, addOrder, getById, updateorder, deleteOrder };
