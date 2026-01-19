import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(savedCart);
  }, []);

  const updateQuantity = (id, delta) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = Math.min(
          item.stockQuantity,
          Math.max(1, item.quantity + delta),
        );
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const filtered = cartItems.filter((item) => item.id !== id);
    setCartItems(filtered);
    localStorage.setItem("cart", JSON.stringify(filtered));
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (!user) {
      alert("Будь ласка, увійдіть для оформлення замовлення");
      navigate("/login");
      return;
    }

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await api.post("/orders", orderData);

      localStorage.removeItem("cart");
      setCartItems([]);
      alert("Замовлення успішно створено!");
      navigate("/profile");
    } catch (err) {
      alert("Помилка при створенні замовлення");
    }
  };

  return (
    <div className="layout-wrapper">
      <header className="header">
        <Link to="/" className="store-name">
          NutriShop
        </Link>
        <div className="header-actions">
          {user ? (
            <div className="user-profile-section">
              <Link to="/profile" className="profile-info">
                <div className="profile-icon">
                  {(user.username || user.Username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="username-text">
                  {user.username || user.Username}
                </span>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              Увійти
            </Link>
          )}
        </div>
      </header>

      <main className="cart-page">
        {cartItems.length > 0 ? (
          <>
            <h2>Мій кошик</h2>
            <div className="cart-container">
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <img
                      src={
                        item.imageUrl
                          ? `http://localhost:5102${item.imageUrl}`
                          : "https://via.placeholder.com/100"
                      }
                      alt={item.name}
                    />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="price">${item.price}</p>
                    </div>

                    <div className="custom-qty-selector">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3>Підсумок</h3>
                <div
                  className="summary-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <span>Разом:</span>
                  <span
                    className="total-sum"
                    style={{
                      fontWeight: "800",
                      fontSize: "20px",
                      color: "#0077ff",
                    }}
                  >
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Оплатити замовлення
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-cart-msg">
            <h2>Ваш кошик порожній</h2>
            <p className="info-text">
              Всі ваші оплачені замовлення знаходяться в профілі.
            </p>
            <Link
              to="/"
              className="add-btn"
              style={{
                display: "inline-block",
                marginTop: "20px",
                textDecoration: "none",
              }}
            >
              До покупок
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
