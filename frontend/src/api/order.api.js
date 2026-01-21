// order.api.js
import api from "./axios"; // Переконайтеся, що шлях правильний

export const getOrders = async () => {
  // МАЄ БУТИ api.get, а не axios.get
  const response = await api.get("/orders");
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/change-status/${id}`, {
    status: status,
  });
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};
