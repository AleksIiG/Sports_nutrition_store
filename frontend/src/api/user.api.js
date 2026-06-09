import axios from "axios";

const API_URL = "http://localhost:5102/api/auth";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getUsers = async (username = "") => {
  const response = await axios.get(`${API_URL}/users`, {
    ...getAuthHeaders(),
    params: username ? { username } : {},
  });

  return response.data;
};

export const promoteUser = async (id) => {
  const response = await axios.post(
    `${API_URL}/promote/${id}`,
    {},
    getAuthHeaders(),
  );

  return response.data;
};

export const demoteUser = async (id) => {
  const response = await axios.post(
    `${API_URL}/demote/${id}`,
    {},
    getAuthHeaders(),
  );

  return response.data;
};