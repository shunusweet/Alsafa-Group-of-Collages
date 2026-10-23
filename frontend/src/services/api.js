
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Sirf student attendance requests studentToken use karengi
    const isStudentAttendanceRequest =
      /\/attendance\/(mine|mark)(?:\/|$|\?)/i.test(url);

    const token = isStudentAttendanceRequest
      ? localStorage.getItem("studentToken")
      : localStorage.getItem("token");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
      console.error(
        "Missing authentication token for:",
        url,
        isStudentAttendanceRequest ? "studentToken" : "token"
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
