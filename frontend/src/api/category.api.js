import api from "./axios";

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Помилка при отриманні категорій:", error);
    throw error;
  }
};

export const createCategory = async (data) =>
  (await api.post("/categories", data)).data;
export const updateCategory = async (id, data) =>
  (await api.put(`/categories/${id}`, data)).data;
export const deleteCategory = async (id) =>
  (await api.delete(`/categories/${id}`)).data;
