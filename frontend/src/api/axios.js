import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5102/api",
});

export default api;
