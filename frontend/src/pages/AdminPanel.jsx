import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUsers, promoteUser, demoteUser } from "../api/user.api";
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
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
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

    if (activeTab === "orders") {
      loadOrders();
    }

    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      const pData = await getProducts();
      const cData = await getCategories();
      setProducts(pData);
      setCategories(cData);
    } catch (err) {
      console.error("Error loading products/categories", err);
      if (err.response?.status === 403) {
        alert("Доступ заборонено (403). Перевірте роль користувача.");
      }
    }
  };

  const loadOrders = async () => {
    try {
      const oData = await getOrders();
      const uData = await getUsers();

      setOrders(oData);
      setUsers(uData);
    } catch (err) {
      console.error("Error loading orders", err);
    }
  };

  const loadUsers = async (username = "") => {
    try {
      const uData = await getUsers(username);
      setUsers(uData);
    } catch (err) {
      console.error("Error loading users", err);

      if (err.response?.status === 403) {
        alert("У вас немає прав адміністратора!");
      } else {
        alert("Не вдалося завантажити користувачів.");
      }
    }
  };

  const getUserById = (userId) => {
    return users.find((u) => u.id === userId);
  };

  const openUserInfo = (userId) => {
    const user = getUserById(userId);

    if (!user) {
      alert("Інформацію про користувача не знайдено");
      return;
    }

    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const refreshSelectedUser = async (userId) => {
    const uData = await getUsers(userSearchTerm);
    setUsers(uData);

    const updatedUser = uData.find((u) => u.id === userId);
    if (updatedUser) {
      setSelectedUser(updatedUser);
    }
  };

  const handleUserSearch = async (e) => {
    const value = e.target.value;
    setUserSearchTerm(value);
    await loadUsers(value);
  };

  const handlePromoteUser = async (id) => {
    if (!window.confirm("Зробити цього користувача адміністратором?")) return;

    try {
      await promoteUser(id);
      await refreshSelectedUser(id);
    } catch (err) {
      console.error("Error promoting user", err);
      alert("Не вдалося змінити роль користувача.");
    }
  };

  const handleDemoteUser = async (id) => {
    if (!window.confirm("Забрати права адміністратора у цього користувача?"))
      return;

    try {
      await demoteUser(id);
      await refreshSelectedUser(id);
    } catch (err) {
      console.error("Error demoting user", err);
      alert("Не вдалося змінити роль користувача.");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { Name: catFormData.name };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      setIsCatModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Error saving category:", err);
      if (err.response?.status === 403) {
        alert("У вас немає прав адміністратора!");
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setServerErrors([]);

    try {
      const data = new FormData();
      data.append("Name", formData.name);
      data.append("Description", formData.description);
      data.append("Manufacturer", formData.manufacturer);
      data.append("Volume", formData.volume);

      let priceVal = formData.price.toString().replace(",", ".");
      if (!priceVal || isNaN(parseFloat(priceVal))) {
        setServerErrors(["Некоректна ціна"]);
        return;
      }

      data.append("Price", parseFloat(priceVal));
      data.append("StockQuantity", parseInt(formData.stockQuantity) || 0);

      const catId = parseInt(formData.categoryId);
      if (!catId || isNaN(catId)) {
        setServerErrors(["Оберіть категорію!"]);
        return;
      }

      data.append("CategoryId", catId);

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
      loadData();
    } catch (err) {
      console.error("Error saving product:", err);
      const status = err.response?.status;

      if (status === 403) {
        setServerErrors(["Доступ заборонено! У вас немає прав Адміна."]);
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setServerErrors(errors);
      } else {
        setServerErrors(["Сталася помилка при збереженні товару."]);
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Ви точно хочете видалити цей товар?")) return;

    try {
      await deleteProduct(id);
      loadData();
    } catch (err) {
      console.error("Error deleting product:", err);

      if (err.response?.status === 403) {
        alert("Помилка 403: У вас немає прав на видалення.");
      } else {
        alert(
          "Не вдалося видалити товар. Можливо, він використовується в замовленнях.",
        );
      }
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
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

        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Users
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
                            name: p.name || "",
                            price: p.price || "",
                            description: p.description || "",
                            manufacturer: p.manufacturer || "",
                            volume: p.volume || "",
                            stockQuantity: p.stockQuantity ?? 0,
                            categoryId: p.categoryId || "",
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
                        onClick={() => handleDeleteProduct(p.id)}
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
                            if (window.confirm("Видалити категорію?")) {
                              try {
                                await deleteCategory(c.id);
                                loadData();
                              } catch (e) {
                                alert("Помилка видалення категорії");
                              }
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
                  <th>User</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => {
                  const orderUser = getUserById(o.userId);

                  return (
                    <tr key={o.id}>
                      <td>#{o.id}</td>

                      <td>
                        <button
                          className="user-link-btn"
                          onClick={() => openUserInfo(o.userId)}
                        >
                          {orderUser?.username || `User #${o.userId}`}
                        </button>
                      </td>

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
                            if (window.confirm("Видалити?")) {
                              deleteOrder(o.id)
                                .then(loadOrders)
                                .catch(() => alert("Помилка видалення"));
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

        {activeTab === "users" && (
          <section>
            <div className="admin-header">
              <h1>Users Management</h1>
            </div>

            <div className="admin-filters">
              <input
                type="text"
                placeholder="Пошук за іменем..."
                value={userSearchTerm}
                onChange={handleUserSearch}
                className="filter-input"
              />
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>

                    <td>
                      <button
                        className="user-link-btn"
                        onClick={() => {
                          setSelectedUser(u);
                          setIsUserModalOpen(true);
                        }}
                      >
                        {u.username}
                      </button>
                    </td>

                    <td>{u.email}</td>

                    <td>
                      <span
                        className={`role-badge role-${u.role?.toLowerCase()}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td>
                      {u.role === "Admin" ? (
                        <button
                          className="delete-btn"
                          onClick={() => handleDemoteUser(u.id)}
                        >
                          Demote
                        </button>
                      ) : (
                        <button
                          className="edit-btn"
                          onClick={() => handlePromoteUser(u.id)}
                        >
                          Promote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      Користувачів не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>

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
              <label>Назва товару</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
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
                  <label>Кількість</label>
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

              <label>Опис</label>
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

      {isOrderModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-details">
            <h3>Замовлення #{selectedOrder.id}</h3>

            <div className="order-info">
              <p>
                <strong>Користувач:</strong>{" "}
                <button
                  className="user-link-btn"
                  onClick={() => openUserInfo(selectedOrder.userId)}
                >
                  {getUserById(selectedOrder.userId)?.username ||
                    `User #${selectedOrder.userId}`}
                </button>
              </p>

              <p>
                <strong>Дата:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>

              <div
                className="contact-info-block"
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                  borderLeft: "4px solid #0077ff",
                  borderRadius: "4px",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Контактна інформація:</strong>
                </p>

                <p style={{ margin: "5px 0 0 0", whiteSpace: "pre-wrap" }}>
                  {selectedOrder.contactInfo || "Не вказано"}
                </p>
              </div>
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

      {isUserModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Інформація про користувача</h3>

            <div className="order-info">
              <p>
                <strong>ID:</strong> {selectedUser.id}
              </p>

              <p>
                <strong>Username:</strong> {selectedUser.username}
              </p>

              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                <span
                  className={`role-badge role-${selectedUser.role?.toLowerCase()}`}
                >
                  {selectedUser.role}
                </span>
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="clear-btn"
                style={{ backgroundColor: "#95a5a6", color: "white" }}
                onClick={() => setIsUserModalOpen(false)}
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
