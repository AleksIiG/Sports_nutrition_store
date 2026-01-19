import { createContext, useState, useEffect, useContext } from "react";
import { getMe } from "../api/auth.api";

// 1. Створюємо сам контекст
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          // Викликаємо твій API контролер /me
          const userData = await getMe();
          setUser(userData);
        } catch (err) {
          console.error("Авторизація не вдалася", err);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 2. ЕКСПОРТ ХУКА (саме цього рядка у тебе, скоріш за все, не вистачає)
export const useAuth = () => useContext(AuthContext);