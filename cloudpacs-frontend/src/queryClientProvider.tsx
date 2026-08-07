import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:5001/",
  headers: {
    "Authorizaiton": `Bearer ${localStorage.getItem('token')}`,
    "Content-Type": "application/json"
  }
});

// REQUEST interceptor — runs before every request leaves the browser
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; // must return config or the request is cancelled
});

// RESPONSE interceptor — runs after every response arrives
api.interceptors.response.use(
  (response) => response, // 2xx: pass through unchanged
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // clear stale/expired token
      window.location.replace('/UnAuthorized'); // redirect to login page
    }
    return Promise.reject(error); // re-throw so callers can still catch it
  }
);
export default api;