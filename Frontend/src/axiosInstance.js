// Frontend/src/axiosInstance.js
import axios from "axios";

/**
 * Base URL is taken from Vite env var VITE_API_URL in production,
 * otherwise falls back to localhost for local dev.
 *
 * On Netlify set VITE_API_URL=https://your-backend.example
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4001";

const api = axios.create({
  baseURL,
  // you can add global timeout / headers here if needed
  // timeout: 10000,
});

export default api;
