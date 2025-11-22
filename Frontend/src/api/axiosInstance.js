import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4001",
  withCredentials: true,
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
