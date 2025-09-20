// Model/orderModel.js
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    order_Date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    customer_Name: {
      type: String,
      required: true,
    },
    order_type: {
      type: String,
      enum: ["sales_Order", "purchase_Order"],
      required: true,
    },
    order_Items: [
      {
        product_Name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        size: { type: String },
        color: { type: String },
      },
    ],
    email: {
      type: String,
      required: true,
    },
    contact_No: {
      type: String,
      required: true,
    },
    order_Status: {
      type: String,
      enum: ["CONFIRMED", "PROCESSING", "SUCCESSFUL", "DELIVERED"],
      default: "CONFIRMED",
      required: true,
    },
    description: {
      type: String,
    },
    sub_Total: {
      type: Number,
      required: true,
      default: 0,
    },
    delivery_Address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// ✅ ESM export
export default mongoose.model("Order", orderSchema);
