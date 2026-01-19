import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../api/product.api";
import { getCategories } from "../api/category.api";
import "../styles/main.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 0, name: "All" }]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState({ id: 0, name: "All" });
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();

  // --- ЛОГІКА КОШИКА ---
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const productId = product.id || product.Id;
    const productName = product.name || product.Name;
    const productPrice = product.price || product.Price;
    const productImg = product.imageUrl || product.ImageUrl;
    const productStock =
      product.stockQuantity !== undefined
        ? product.stockQuantity
        : product.StockQuantity;

    // 1. Перевірка, чи товар взагалі є в наявності
    if (productStock <= 0) {
      alert("Вибачте, цього товару немає в наявності");
      return;
    }

    const existingItemIndex = cart.findIndex((item) => item.id === productId);

    if (existingItemIndex > -1) {
      // 2. Перевірка, чи не додаємо ми більше, ніж є на складі
      if (cart[existingItemIndex].quantity >= productStock) {
        alert(
          `Не можна додати більше ніж ${productStock} шт. (максимум на складі)`,
        );
        return;
      }
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: productName,
        price: productPrice,
        imageUrl: productImg,
        quantity: 1,
        stockQuantity: productStock,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${productName} додано до кошика!`);
  };

  // --- ЗАВАНТАЖЕННЯ КАТЕГОРІЙ ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const formatted = data.map((c) => ({
          id: c.id || c.Id,
          name: c.name || c.Name,
        }));
        setCategories([{ id: 0, name: "All" }, ...formatted]);
      } catch (err) {
        console.error("Помилка категорій", err);
      }
    };
    fetchCategories();
  }, []);

  // --- ЗАВАНТАЖЕННЯ ТОВАРІВ ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = {};
        if (search.trim() !== "") queryParams.Name = search;
        if (activeCategory && activeCategory.name !== "All") {
          queryParams.Category = activeCategory.name;
        } else {
          queryParams.Category = "";
        }

        const data = await getProducts(queryParams);
        setProducts(data);
      } catch (err) {
        console.error("Помилка завантаження товарів", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  return (
    <div className="layout-wrapper">
      <header className="header">
        <Link to="/" className="store-name">
          NutriShop
        </Link>
        <div className="search-container">
          <input
            type="text"
            placeholder="Пошук добавок..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="header-actions">
          {/* ДОДАНО: Кнопка адміна зліва від кошика */}
          {user && (user.role === "Admin" || user.Role === "Admin") && (
            <Link
              to="/admin"
              className="admin-link"
              style={{ marginRight: "15px", textDecoration: "none" }}
            >
              ⚙️ Admin
            </Link>
          )}

          <Link to="/cart" className="cart-link">
            🛒 Кошик
          </Link>
          {user ? (
            <div className="user-profile-section">
              <Link to="/profile" className="profile-info">
                <div className="profile-icon">
                  {(user.username || user.Username)?.[0].toUpperCase()}
                </div>
                <span className="username-text">
                  {user.username || user.Username}
                </span>
              </Link>
              <button onClick={logout} className="logout-small-btn">
                Вийти
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">
                Увійти
              </Link>
              <Link to="/register" className="register-btn-header">
                Реєстрація
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="products-page">
        <aside className="sidebar">
          <h4>Категорії</h4>
          <div className="sidebar-buttons">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={activeCategory.id === cat.id ? "active" : ""}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        <div className="content-wrapper">
          <main className="main-content">
            {loading ? (
              <div className="loading-state">Завантаження...</div>
            ) : (
              products.map((p) => (
                <div key={p.id || p.Id} className="product-card">
                  <Link
                    to={`/product/${p.id || p.Id}`}
                    className="product-card-link"
                  >
                    <div className="product-img-container">
                      <img
                        src={
                          p.imageUrl ||
                          p.ImageUrl ||
                          "https://via.placeholder.com/200"
                        }
                        alt={p.name || p.Name}
                      />
                    </div>
                    <div className="card-body">
                      <h3>{p.name || p.Name}</h3>
                    </div>
                  </Link>

                  <div className="card-footer-wrapper">
                    <div className="card-footer">
                      <span className="price">${p.price || p.Price}</span>
                      {/* Перевірка залишку для відображення кнопки */}
                      {p.stockQuantity > 0 || p.StockQuantity > 0 ? (
                        <button
                          className="add-btn"
                          onClick={() => addToCart(p)}
                        >
                          Купити
                        </button>
                      ) : (
                        <button
                          className="add-btn disabled-btn"
                          disabled
                          style={{ background: "#ccc", cursor: "not-allowed" }}
                        >
                          Немає
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Products;
