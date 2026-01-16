import { useEffect, useState } from "react";
import { getProducts } from "../api/product.api";

function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then(data => setProducts(data))
      .catch(err => {
        console.error(err);
        setError("Не вдалося завантажити продукти");
      });
  }, []);

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Products</h1>

      {products.length === 0 && <p>Немає продуктів</p>}

      {products.map(p => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{p.name}</h3>
          <p>Price: {p.price}</p>
        </div>
      ))}
    </div>
  );
}

export default Products;
