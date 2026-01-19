import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/product.api";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/category.api";
import { getOrders, updateOrderStatus, deleteOrder } from "../api/order.api";
import "../styles/admin.css";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [serverErrors, setServerErrors] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    manufacturer: "",
    volume: "",
    stockQuantity: 0,
    categoryId: "",
  });
  const [catFormData, setCatFormData] = useState({ name: "" });

  const [imageFile, setImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    loadData();
    if (activeTab === "orders") loadOrders();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const pData = await getProducts();
      const cData = await getCategories();
      setProducts(pData);
      setCategories(cData);
    } catch (err) {
      console.error("Error loading products/categories", err);
    }
  };

  const loadOrders = async () => {
    try {
      const oData = await getOrders();
      setOrders(oData);
    } catch (err) {
      console.error("Error loading orders", err);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, catFormData);
      } else {
        await createCategory(catFormData);
      }
      setIsCatModalOpen(false);
      loadData(); // Оновлення списку без alert
    } catch (err) {
      console.error("Помилка при збереженні категорії", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesName = p.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "" || p.categoryId === parseInt(filterCategory);
    return matchesName && matchesCategory;
  });

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setServerErrors([]);

    try {
      const data = new FormData();
      data.append("Name", formData.name);
      data.append("Description", formData.description);
      data.append("Manufacturer", formData.manufacturer);
      data.append("Volume", formData.volume);

      const priceValue = formData.price.toString().replace(",", ".");
      data.append("Price", priceValue);
      data.append("StockQuantity", parseInt(formData.stockQuantity) || 0);
      data.append("CategoryId", parseInt(formData.categoryId));

      if (editingProduct) {
        if (editImageFile) {
          data.append("Image", editImageFile);
        }
        await updateProduct(editingProduct.id, data);
      } else {
        if (imageFile) {
          data.append("Image", imageFile);
        }
        await createProduct(data);
      }

      setIsModalOpen(false);
      loadData(); // Оновлення списку без alert
    } catch (err) {
      console.error("Помилка:", err.response?.data);
      const errors = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()
        : ["Сталася помилка при обробці ціни або полів"];
      setServerErrors(errors);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Оновлення списку без alert
    } catch (err) {
      console.error("Помилка при зміні статусу:", err);
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <Link to="/" className="back-home-link">
          ← На головну магазину
        </Link>
        <div className="sidebar-divider"></div>
        <button
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </aside>

      <main className="admin-content">
        {activeTab === "products" && (
          <section>
            <div className="admin-header">
              <h1>Products Management</h1>
              <button
                className="add-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    price: "",
                    description: "",
                    manufacturer: "",
                    volume: "",
                    stockQuantity: 0,
                    categoryId: "",
                  });
                  setImageFile(null);
                  setEditImageFile(null);
                  setServerErrors([]);
                  setIsModalOpen(true);
                }}
              >
                + Add Product
              </button>
            </div>
            <div className="admin-filters">
              <input
                type="text"
                placeholder="Пошук..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">Всі категорії</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <img
                        src={p.imageUrl || "https://via.placeholder.com/40"}
                        alt=""
                        width="40"
                        height="40"
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{p.price} ₴</td>
                    <td>{p.stockQuantity}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingProduct(p);
                          setFormData({
                            name: p.name || p.Name || "",
                            price: p.price || p.Price || "",
                            description: p.description || p.Description || "",
                            manufacturer:
                              p.manufacturer || p.Manufacturer || "",
                            volume: p.volume || p.Volume || "",
                            stockQuantity:
                              p.stockQuantity ?? p.StockQuantity ?? 0,
                            categoryId: p.categoryId || p.CategoryId || "",
                          });
                          setEditImageFile(null);
                          setServerErrors([]);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          if (window.confirm("Видалити?"))
                            deleteProduct(p.id).then(loadData);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "categories" && (
          <section>
            <div className="admin-header">
              <h1>Categories Management</h1>
              <button
                className="add-btn"
                onClick={() => {
                  setEditingCategory(null);
                  setCatFormData({ name: "" });
                  setIsCatModalOpen(true);
                }}
              >
                + Add Category
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Products Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const pCount = products.filter(
                    (p) => p.categoryId === c.id,
                  ).length;
                  return (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                      <td>{pCount} товарів</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingCategory(c);
                            setCatFormData({ name: c.name });
                            setIsCatModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={async () => {
                            if (pCount > 0) return; // Можна додати тиху помилку в UI замість alert, але поки прибрано просто повідомлення
                            if (window.confirm("Видалити категорію?")) {
                              await deleteCategory(c.id);
                              loadData();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "orders" && (
          <section>
            <div className="admin-header">
              <h1>Orders Management</h1>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>Користувач #{o.userId}</td>
                    <td>{o.totalPrice} ₴</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className={`status-select status-${o.status?.toLowerCase()}`}
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o.id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsOrderModalOpen(true);
                        }}
                      >
                        Details
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          if (window.confirm("Видалити?"))
                            deleteOrder(o.id).then(loadOrders);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* MODAL PRODUCTS */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content admin-modal">
            <h3>
              {editingProduct ? "Редагувати товар" : "Додати новий товар"}
            </h3>

            {serverErrors.length > 0 && (
              <div
                className="error-messages"
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  background: "#fff5f5",
                  border: "1px solid red",
                  borderRadius: "4px",
                }}
              >
                {serverErrors.map((msg, i) => (
                  <p
                    key={i}
                    style={{ color: "red", margin: "2px 0", fontSize: "14px" }}
                  >
                    • {msg}
                  </p>
                ))}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="admin-form">
              <label>Назва товару (мін. 2 симв.)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Наприклад: Whey Protein"
              />

              <div
                className="form-row"
                style={{ display: "flex", gap: "10px" }}
              >
                <div style={{ flex: 1 }}>
                  <label>Виробник</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                    required
                    placeholder="Optimum Nutrition"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Об'єм/Вага</label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) =>
                      setFormData({ ...formData, volume: e.target.value })
                    }
                    required
                    placeholder="900g / 500ml"
                  />
                </div>
              </div>

              <div
                className="form-row"
                style={{ display: "flex", gap: "10px" }}
              >
                <div style={{ flex: 1 }}>
                  <label>Ціна (₴)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Кількість на складі</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <label>Категорія</label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
              >
                <option value="">Оберіть категорію</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label>Опис (мін. 5 симв.)</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows="4"
              />

              <label>
                Зображення{" "}
                {editingProduct && "(залиште порожнім, щоб не змінювати)"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  editingProduct
                    ? setEditImageFile(e.target.files[0])
                    : setImageFile(e.target.files[0])
                }
              />

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Зберегти товар
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIES */}
      {isCatModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
            <form onSubmit={handleCategorySubmit}>
              <label>Назва категорії</label>
              <input
                type="text"
                value={catFormData.name}
                onChange={(e) => setCatFormData({ name: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Зберегти
                </button>
                <button type="button" onClick={() => setIsCatModalOpen(false)}>
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ORDER DETAILS */}
      {isOrderModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-details">
            <h3>Замовлення #{selectedOrder.id}</h3>
            <div className="order-info">
              <p>
                <strong>User ID:</strong> {selectedOrder.userId}
              </p>
              <p>
                <strong>Дата:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>
            <hr />
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Ціна за од.</th>
                  <th>К-сть</th>
                  <th>Сума</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, idx) => {
                  const productInfo = products.find(
                    (p) => p.id === item.productId,
                  );
                  return (
                    <tr key={idx}>
                      <td style={{ textAlign: "left" }}>
                        {productInfo ? (
                          <strong>{productInfo.name}</strong>
                        ) : (
                          <span style={{ color: "#888" }}>
                            Товар #{item.productId} (видалено)
                          </span>
                        )}
                      </td>
                      <td>{item.priceAtPurchase} ₴</td>
                      <td>{item.quantity} шт.</td>
                      <td>{item.priceAtPurchase * item.quantity} ₴</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div
              style={{
                marginTop: "15px",
                textAlign: "right",
                fontSize: "1.2rem",
              }}
            >
              <strong>Разом: {selectedOrder.totalPrice} ₴</strong>
            </div>
            <div className="modal-actions">
              <button
                className="clear-btn"
                style={{ backgroundColor: "#95a5a6", color: "white" }}
                onClick={() => setIsOrderModalOpen(false)}
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;