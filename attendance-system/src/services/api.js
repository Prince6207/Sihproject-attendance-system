// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`, // your backend URL
  withCredentials: true, // important for cookies
});

export default api;