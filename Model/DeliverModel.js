const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeliverSchema = new Schema({
  deliveryId: {
    type: String,
    required: true,
    unique: true   // ensure unique delivery IDs
  },

  orderId: { type: String, required: true },

  receiverName: { type: String, required: true },
  receiverAddress: { type: String, required: true },
  receiverPhone: { type: String, required: true },

  courierName: { type: String, required: true },
  courierPhone: { type: String, required: true },

  itemDescription: { type: String },
  quantity: { type: Number, default: 1 },
  weight: { type: Number },

  deliveryDate: { type: Date, required: true },

  status: { 
    type: String, 
    enum: ["Pending", "In Transit", "Delivered", "Cancelled"], 
    default: "Pending" 
  },

  paymentStatus: { 
    type: String, 
    enum: ["Unpaid", "Paid"], 
    default: "Unpaid" 
  },

  createdAt: { type: Date, default: Date.now },

  // 🚚 Tracking fields
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },

  lastUpdateAt: { type: Date }
});

module.exports = mongoose.model("DeliverModel", DeliverSchema);
