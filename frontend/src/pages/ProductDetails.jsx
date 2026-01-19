import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../api/product.api";
import { createComment } from "../api/comment.api";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, logout } = useAuth();

  const fetchProduct = async () => {
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setError("Не вдалося завантажити товар.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      cart[existingIndex].quantity = Math.min(newQty, product.stockQuantity);
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity,
        stockQuantity: product.stockQuantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Товар додано до кошика!");
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim().length < 5) {
      alert("Мінімум 5 символів");
      return;
    }
    try {
      setIsSubmitting(true);
      await createComment({ content: newComment, productId: Number(id) });
      setNewComment("");
      await fetchProduct();
    } catch (err) {
      alert("Помилка авторизації або валідації");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Завантаження...</div>;
  if (error)
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <Link to="/">Назад</Link>
      </div>
    );
  if (!product) return null;
  

  return (
    <div className="layout-wrapper">
      <header className="header">
        <Link to="/" className="store-name">
          NutriShop
        </Link>
        <div className="header-actions">
          <Link to="/cart" className="cart-link-icon">
            Кошик 🛒
          </Link>
          {user ? (
            <div className="user-profile-section">
              <span className="username-text">
                {user.username || user.Username}
              </span>
              <button onClick={logout} className="logout-small-btn">
                Вийти
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              Увійти
            </Link>
          )}
        </div>
      </header>

      <main className="product-details-container-full">
        <div className="product-view">
          <div className="product-image-section">
            <img
              src={
                product.imageUrl
                  ? `http://localhost:5102${product.imageUrl}`
                  : "https://via.placeholder.com/400"
              }
              alt={product.name}
            />
          </div>

          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
              <span className="category-badge">Артикул: {product.id}</span>
              <span className="stock-badge">
                Залишок: {product.stockQuantity}
              </span>
            </div>
            <div className="product-specs">
              <p>
                <strong>Виробник:</strong>{" "}
                {product.manufacturer || "Не вказано"}
              </p>
              <p>
                <strong>Об'єм:</strong> {product.volume || "Не вказано"}
              </p>
            </div>
            <p className="price-tag-blue">${product.price}</p>
            <div className="product-description">
              <h3>Опис</h3>
              <p>{product.description}</p>
            </div>

            {product.stockQuantity > 0 && (
              <div className="quantity-container">
                <div className="custom-qty-selector">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="qty-input-no-spin"
                    value={quantity}
                    readOnly
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() =>
                      setQuantity(Math.min(product.stockQuantity, quantity + 1))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              className="add-to-cart-big-blue"
              disabled={product.stockQuantity <= 0}
              onClick={addToCart}
            >
              {product.stockQuantity > 0
                ? "Додати у кошик"
                : "Немає в наявності"}
            </button>
          </div>
        </div>

        <section className="comments-section-refined">
          <h3>Відгуки ({product.comments?.length || 0})</h3>
          {user ? (
            <form className="comment-post-form" onSubmit={handleCommentSubmit}>
              <textarea
                placeholder="Ваш відгук..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={isSubmitting}>
                Надіслати
              </button>
            </form>
          ) : (
            <p>Увійдіть, щоб залишити відгук</p>
          )}
          <div className="comments-list-refined">
            {product.comments?.map((c) => (
              <div key={c.id} className="comment-card-refined">
                <div className="comment-user-info">
                  <span className="user-avatar">U</span>
                  <div>
                    <span className="user-name">Користувач #{c.userId}</span>
                    <span className="comment-date">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p>{c.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductDetails;
