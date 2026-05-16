// src/services/api.js

import axios from "axios";
import { auth } from "../firebase";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 25000,
});

// Otomatis sisipkan Firebase ID token di setiap request ke backend
// Persiapan untuk fitur auth token verification di backend (audit #7)
API.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle error response secara terpusat
// Mengambil pesan error dari backend, fallback ke pesan generic
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "Terjadi kesalahan jaringan";
    return Promise.reject(new Error(msg));
  }
);

export default API;