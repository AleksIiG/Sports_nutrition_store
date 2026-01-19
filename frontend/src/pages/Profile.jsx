import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/order.api";
import { getProducts } from "../api/product.api"; // Додано
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";

function Profile() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); // Додано для назв товарів
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  // Стейт для модалки
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          getMyOrders(),
          getProducts(),
        ]);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (err) {
        console.error("Помилка завантаження даних", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>Ви не увійшли в систему</h2>
          <Link
            to="/login"
            className="auth-btn"
            style={{
              textDecoration: "none",
              display: "block",
              textAlign: "center",
            }}
          >
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-wrapper">
      <header className="header">
        <Link to="/" className="store-name">
          NutriShop
        </Link>
        <div className="header-actions">
          <Link to="/cart" className="cart-link">
            Кошик 🛒
          </Link>
          <button onClick={logout} className="logout-small-btn">
            Вийти
          </button>
        </div>
      </header>

      <main
        className="profile-page"
        style={{ padding: "100px 10%", minHeight: "100vh" }}
      >
        <section
          className="user-info-card"
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            marginBottom: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h1>Мій профіль</h1>
          <p>
            <strong>Ім'я:</strong> {user.username || user.Username}
          </p>
          <p>
            <strong>Email:</strong> {user.email || user.Email}
          </p>
        </section>

        <section className="orders-history">
          <h2>Історія замовлень</h2>
          {loading ? (
            <p>Завантаження замовлень...</p>
          ) : orders.length > 0 ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="order-item-card"
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "15px",
                    marginBottom: "15px",
                    border: "1px solid #eee",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0 }}>Замовлення #{order.id}</h4>
                      <small style={{ color: "#888" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                      }}
                    >
                      <div>
                        <span
                          className={`status-badge ${order.status.toLowerCase()}`}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            background:
                              order.status === "Paid" ? "#e6fffa" : "#fff5f5",
                            color:
                              order.status === "Paid" ? "#27ae60" : "#ff4757",
                          }}
                        >
                          {order.status}
                        </span>
                        <p
                          style={{
                            margin: "5px 0 0",
                            fontWeight: "bold",
                            color: "#0077ff",
                          }}
                        >
                          {order.totalPrice} ₴
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        style={{
                          background: "#f0f4f8",
                          border: "none",
                          padding: "8px 15px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          color: "#0077ff",
                          fontWeight: "600",
                        }}
                      >
                        Деталі
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#fff",
                borderRadius: "20px",
              }}
            >
              <p>Ви ще нічого не замовляли.</p>
              <Link
                to="/"
                className="add-btn"
                style={{ textDecoration: "none" }}
              >
                Перейти до покупок
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Модальне вікно деталей замовлення */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content"
            style={{ maxWidth: "600px", width: "90%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                Вміст замовлення #{selectedOrder.id}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table
                className="admin-table"
                style={{ width: "100%", textAlign: "left" }}
              >
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>К-сть</th>
                    <th>Ціна</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => {
                    const product = products.find(
                      (p) => p.id === item.productId,
                    );
                    return (
                      <tr key={idx}>
                        <td>
                          {product ? product.name : `Товар #${item.productId}`}
                        </td>
                        <td>{item.quantity} шт.</td>
                        <td>{item.priceAtPurchase} ₴</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: "20px",
                paddingTop: "15px",
                borderTop: "2px solid #eee",
                textAlign: "right",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Разом: {selectedOrder.totalPrice} ₴
              </span>
            </div>

            <button
              className="checkout-btn"
              onClick={() => setIsModalOpen(false)}
              style={{ marginTop: "20px" }}
            >
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
