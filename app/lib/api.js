import axios from "axios";

// const API_BASE_URL = "http://127.0.0.1:8000/api";
const API_BASE_URL = "https://costume-rent.mahesvara.engineer/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Accept": "application/json",
  },
});

/**
 * Helper to get axios instance with Bearer token
 * @param {string} token 
 */
export const getApiClient = (token) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return instance;
};

export default api;
