import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./pages/Products";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Cart from "./pages/Cart";
// import CreateProduct from "./pages/CreateProduct";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Products />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin/create-product" element={<CreateProduct />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
