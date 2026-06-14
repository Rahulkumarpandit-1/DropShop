import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Order";
import ProductDetail from "./pages/productDetail";
import Profile from "./pages/Profile";
import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";
import { Toaster } from "react-hot-toast";
import OrderTracking from "./pages/OrderTracking";
import Products from "./pages/Products";
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from "./pages/Wishlist";
import BottomNavigation from "./Components/BottomNavigation";

function App() {
   const [selectedCategory, setSelectedCategory] = useState("All");
   const location = useLocation();
   const isAdminPath = location.pathname.startsWith("/admin");
  return (
    <>
    <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#111",
            color: "#fff",
            fontSize: "0.85rem",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
          },
          success: {
            iconTheme: { primary: "#30d158", secondary: "#fff" }
          },
          error: {
            iconTheme: { primary: "#ff3b30", secondary: "#fff" }
          }
        }}
      />
      {!isAdminPath && (
        <Navbar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
    <Route path="/" element={
  <Home
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory} // 👈 add this
  />
} /> 
        <Route path="/orders/:orderId/tracking" element={<OrderTracking />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/products" element={<Products/>} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      {!isAdminPath && <BottomNavigation />}
    </>
  );
}

export default App;