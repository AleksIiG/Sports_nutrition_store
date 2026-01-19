import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5102/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // ПЕРЕВІРТЕ НАЗВУ ТУТ
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token attached:", token); // Додайте це для перевірки в консолі
    } else {
      console.warn("No token found in localStorage!");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
