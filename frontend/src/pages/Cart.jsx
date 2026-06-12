import { useEffect, useState } from "react";
import { getCart, BASE_URL } from "../services/api";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    const data = await getCart();
    const items = data.items || data.cart?.items || [];
    setCart(items);
    calculateTotal(items);
  };

  const calculateTotal = (items) => {
    const safeItems = Array.isArray(items) ? items : [];
    const sum = safeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  const handleIncrement = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/cart/${itemId}/increment`, {
        method: "PUT", headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return;
      await fetchCart();
    } catch (err) { console.error("Increment error:", err); }
  };

  const handleDecrement = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/cart/${itemId}/decrement`, {
        method: "PUT", headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;
      await fetchCart();
    } catch (err) { console.error("Decrement error:", err); }
  };

  const handleRemove = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/cart/${itemId}/remove`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;
      await fetchCart();
    } catch (err) { console.error("Remove error:", err); }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">

        {/* Header */}
        <div className="cart-header">
          <h2 className="cart-title">Your Cart</h2>
          <p className="cart-count">{cart.length} {cart.length === 1 ? "item" : "items"}</p>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty__icon">🛍</p>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <button className="cart-shop-btn" onClick={() => navigate("/")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">

            {/* Items */}
            <div className="cart-items">
              {cart.map((item) => (
                
                <div key={item._id} className="cart-item">
                  <div className="cart-item__img-wrap">
                    <img src={item.image} alt={item.name} className="cart-item__img" />
                  </div>
                  <div className="cart-item__details">
                    <h3 className="cart-item__name">{item.name}</h3>
                    <p className="cart-item__price">₹{item.price.toLocaleString()}</p>

                    {/* Quantity Controls */}
                    <div className="cart-item__qty">
                      <button className="qty-btn"
                       onClick={() => handleDecrement(item._id || item.id)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                     <button
  className="qty-btn"
  disabled={item.quantity >= item.stock} // 👈 disable when qty reaches stock
  onClick={() => handleIncrement(item._id)}
  style={{
    opacity: item.quantity >= item.stock ? 0.4 : 1,
    cursor: item.quantity >= item.stock ? "not-allowed" : "pointer"
  }}
>+</button>
                    </div>

                    {/* Actions */}
                    <div className="cart-item__actions">
                     <button
  className="cart-buy-btn"
  disabled={item.quantity > item.stock}
  style={{
    opacity: item.quantity > item.stock ? 0.4 : 1,
    cursor: item.quantity > item.stock ? "not-allowed" : "pointer",
    pointerEvents: item.quantity > item.stock ? "none" : "auto" // 👈 add this
  }}
  onClick={() => navigate("/checkout",{state:{itemId:item._id}})}
>
  Buy Now
</button>
                      <button className="cart-remove-btn" onClick={() => handleRemove(item._id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <h3 className="cart-summary__title">Order Summary</h3>
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="cart-summary__row">
                <span>Delivery</span>
                <span className="cart-summary__free">Free</span>
              </div>
              <div className="cart-summary__divider"></div>
              <div className="cart-summary__row cart-summary__total">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <button className="cart-checkout-btn" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
              <p className="cart-summary__cod">💵 Cash on Delivery available</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;