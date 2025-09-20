const Deliver = require("../Model/DeliverModel");
const TrackingEvent = require("../Model/TrackingEventModel");

// Driver sends GPS location
const addLocationUpdate = async (req, res) => {
  const { deliveryId } = req.params;
  const { lat, lng, speed } = req.body;

  try {
    // Save the event in history
    const event = await TrackingEvent.create({
      deliveryId,
      location: { lat, lng },
      speed
    });

    // Update latest location in DeliverModel
    await Deliver.findOneAndUpdate(
      { deliveryId },
      { 
        currentLocation: { lat, lng }, 
        lastUpdateAt: new Date(), 
        status: "In Transit" 
      }
    );

    res.json({ success: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save tracking event" });
  }
};

// Dashboard fetches delivery history
const getHistory = async (req, res) => {
  const { deliveryId } = req.params;

  try {
    const events = await TrackingEvent.find({ deliveryId }).sort({ at: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tracking history" });
  }
};

module.exports = { addLocationUpdate, getHistory };
