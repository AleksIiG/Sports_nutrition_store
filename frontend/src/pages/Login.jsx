import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(formData);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      // Після логіну отримуємо дані про себе
      const { getMe } = await import("../api/auth.api");
      const userDoc = await getMe();
      setUser(userDoc);
      
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Невірний логін або пароль");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Вхід до NutriShop</h2>
        {error && <p className="error-msg">{error}</p>}
        
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@mail.com"
          />
        </div>

        <div className="input-group">
          <label>Пароль</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="auth-btn">Увійти</button>
        
        <p className="auth-footer">
          Немає акаунту? <Link to="/register">Зареєструватися</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;