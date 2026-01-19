import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, getMe } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css"; // ПЕРЕВІР ЦЕЙ ІМПОРТ

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError("");

    try {
      const data = await register(formData);
      
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        const userDoc = await getMe();
        setUser(userDoc);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setFieldErrors(errorData.errors);
      } else if (errorData?.message) {
        setGeneralError(errorData.message);
      } else {
        setGeneralError("Сталася помилка при реєстрації.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Реєстрація</h2>
        
        {generalError && <p className="error-msg">{generalError}</p>}

        <div className="input-group">
          <label>Ім'я користувача</label>
          <input
            type="text"
            className={fieldErrors.Username ? "input-error" : ""}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Ivan_Ivanov"
            required
          />
          {fieldErrors.Username && <span className="field-error">{fieldErrors.Username[0]}</span>}
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            className={fieldErrors.Email ? "input-error" : ""}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@mail.com"
            required
          />
          {fieldErrors.Email && <span className="field-error">{fieldErrors.Email[0]}</span>}
        </div>

        <div className="input-group">
          <label>Пароль</label>
          <input
            type="password"
            className={fieldErrors.Password ? "input-error" : ""}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
          />
          {fieldErrors.Password && <span className="field-error">{fieldErrors.Password[0]}</span>}
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Зачекайте..." : "Зареєструватися"}
        </button>

        <p className="auth-footer">
          Вже маєте акаунт? <Link to="/login">Увійти</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;