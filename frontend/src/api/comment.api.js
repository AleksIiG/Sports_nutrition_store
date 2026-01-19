import api from "./axios";

export const createComment = async (commentData) => {
    // Очікує { content: string, productId: number }
    const response = await api.post("/comments", commentData);
    return response.data;
};

// Метод для адміна (якщо знадобиться видалення)
export const deleteComment = async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
};