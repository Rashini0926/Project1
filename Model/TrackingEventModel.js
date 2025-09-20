const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TrackingEventSchema = new Schema({
  deliveryId: { type: String, required: true, index: true },
  location: { 
    lat: { type: Number }, 
    lng: { type: Number } 
  },
  speed: { type: Number },
  at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TrackingEvent", TrackingEventSchema);
