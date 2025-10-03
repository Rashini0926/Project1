import axios from "axios";

const API = "http://localhost:5000/auth"; // backend URL

export const login = async (username, password) => {
  const { data } = await axios.post(`${API}/login`, { username, password });
  if (data.token) {
    localStorage.setItem("user", JSON.stringify(data)); // save token + role
  }
  return data;
};

export const register = async (username, password, role) => {
  return await axios.post(`${API}/register`, { username, password, role });
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};
