import axios from "axios";

// 🔗 Configure Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000", // change if backend runs elsewhere
  headers: {
    "Content-Type": "application/json",
  },
});

// ========== 🚚 Deliveries API ==========
export const fetchDeliveries = () => API.get("/Deliveries");
export const getDelivery = (id) => API.get(`/Deliveries/${id}`);
export const createDelivery = (payload) => API.post("/Deliveries", payload);
export const updateDelivery = (id, payload) => API.put(`/Deliveries/${id}`, payload);
export const deleteDelivery = (id) => API.delete(`/Deliveries/${id}`);

// ========== 🛰 Tracking API ==========
export const fetchTrackingHistory = (deliveryId) =>
  API.get(`/Tracking/${deliveryId}/history`);

export const postLocation = (deliveryId, body) =>
  API.post(`/Tracking/${deliveryId}/location`, body);

// ========== 👨‍✈ Drivers API ==========
export const listDrivers = (q) =>
  API.get(`/Drivers${q ? `?q=${encodeURIComponent(q)}` : ""}`);

export const getDriver = (id) => API.get(`/Drivers/${id}`);
export const createDriver = (payload) => API.post("/Drivers", payload);
export const updateDriver = (id, payload) => API.put(`/Drivers/${id}`, payload);
export const deleteDriver = (id) => API.delete(`/Drivers/${id}`);

// ========== ❗ Utility: handle API errors (optional) ==========
export const handleApiError = (error) => {
  if (error.response) {
    console.error("API Error:", error.response.data);
    return error.response.data.message || "Server error";
  }
  console.error("Network Error:", error.message);
  return "Network error. Please try again.";
};

export default API;