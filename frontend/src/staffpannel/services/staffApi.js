import axios from "axios";

const staffApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    Accept: "application/json",
  },
});

staffApi.interceptors.request.use(
  (config) => {
    const isLogin = /\/staff-auth\/login\/?$/.test(config.url || "");

    config.headers = config.headers || {};

    if (!isLogin) {
      const token = localStorage.getItem("staffToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default staffApi;