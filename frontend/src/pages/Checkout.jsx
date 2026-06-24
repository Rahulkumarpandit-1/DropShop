import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { placeOrder, getProfile, getCart, createRazorpayOrder, verifyPayment, addAddress, validateCoupon } from "../services/api";
function Checkout() {
  const location = useLocation();
const itemId = location.state?.itemId || null;
const itemIdRef = useRef(location.state?.itemId || null); 
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [address, setAddress] = useState({
    fullName: "", phone: "", street: "", city: "", state: "", pincode: ""
  });
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveToProfile, setSaveToProfile] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchSavedAddress();
  }, []);

  const fetchSavedAddress = async () => {
    try {
      const data = await getProfile();
      if (data.user) {
        const addressesList = data.user.addresses || [];
        setSavedAddresses(addressesList);
        
        if (addressesList.length > 0) {
          const defaultAddr = addressesList.find(a => a.isDefault) || addressesList[0];
          setSelectedAddressId(defaultAddr._id);
          setAddress({
            fullName: defaultAddr.fullName || "",
            phone: defaultAddr.phone || "",
            street: defaultAddr.street || "",
            city: defaultAddr.city || "",
            state: defaultAddr.state || "",
            pincode: defaultAddr.pincode || ""
          });
        } else if (data.user.address) {
          const { street, city, state, pincode, phone } = data.user.address;
          if (street || city) {
            setAddress({
              fullName: data.user.name || "",
              phone: phone || "",
              street: street || "",
              city: city || "",
              state: state || "",
              pincode: pincode || "",
            });
          }
        }
      }
    } catch (err) {
      console.error("fetchSavedAddress error:", err);
    }
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
    setSaveToProfile(false);
  };

  const fetchItems = async () => {
    try {
      const data = await getCart();
      const cartItems = data.items || [];
      const filterId = itemIdRef.current;
      const checkoutItems = filterId 
        ? cartItems.filter(item => item.productId === filterId || item._id === filterId)
        : cartItems;
      setItems(checkoutItems);
      const sub = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setSubtotal(sub);
    } catch (err) {
      console.error("fetchItems error:", err);
    }
  };

  const handleApplyCoupon = async () => {
    const code = coupon.toUpperCase().trim();
    if (!code) return toast.error("Please enter a coupon code");
    
    try {
      const res = await validateCoupon(code, subtotal);
      if (res.valid) {
        setDiscountAmount(res.discount);
        setAppliedCoupon(res.code);
        toast.success(`Coupon ${res.code} applied successfully!`);
      } else {
        toast.error(res.error || "Invalid coupon code");
      }
    } catch (err) {
      console.error("Apply coupon error:", err);
      toast.error("Failed to apply coupon");
    }
  };

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setSelectedAddressId(null);
  };

  const handlePlaceOrder = async () => {
    console.log("itemId being sent:", itemId);
    const { fullName, phone, street, city, state, pincode } = address;
    if (!fullName || !phone || !street || !city || !state || !pincode)
      return toast.error("Please fill all fields");

    setLoading(true);

    if (saveToProfile && !selectedAddressId) {
      try {
        await addAddress({
          fullName, phone, street, city, state, pincode, label: "Home", isDefault: savedAddresses.length === 0
        });
      } catch (err) {
        console.error("Failed to auto-save address:", err);
      }
    }

    const res = await placeOrder(address, itemId, appliedCoupon);
    setLoading(false);

    if (res.order) {
      toast.success("Order placed successfully!");
      navigate("/orders");
    } else {
      toast.error(res.message || "Something went wrong");
    }
  };

  const handleRazorpayPayment = async () => {
    const { fullName, phone, street, city, state, pincode } = address;
    if (!fullName || !phone || !street || !city || !state || !pincode)
      return toast.error("Please fill all fields");

    if (saveToProfile && !selectedAddressId) {
      try {
        await addAddress({
          fullName, phone, street, city, state, pincode, label: "Home", isDefault: savedAddresses.length === 0
        });
      } catch (err) {
        console.error("Failed to auto-save address:", err);
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    // create razorpay order
    const order = await createRazorpayOrder(total);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // 👈 from .env
      amount: order.amount,
      currency: order.currency,
      name: "DropShop",
      description: "Order Payment",
      order_id: order.orderId,
      handler: async (response) => {
        // verify payment
        const res = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          address,
          itemId,
          couponCode: appliedCoupon
        });

        if (res.order) {
          toast.success("Payment successful! Order placed.");
          navigate("/orders");
        } else {
          toast.error(res.error || "Payment failed");
        }
      },
      prefill: {
        name: address.fullName,
        contact: address.phone,
      },
      theme: { color: "#f5f5f7" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "100px 2rem 4rem",
      background: "var(--black)",
      color: "var(--white)",
      fontFamily: "Inter, sans-serif"
    }}>
      <div className="checkout-grid" style={{
        maxWidth: "1000px",
        margin: "0 auto",
        alignItems: "start"
      }}>

        {/* Left — Form */}
        <div>
          <h2 style={{ fontSize: "2.2rem", color: "var(--white)", fontFamily: "Cormorant Garamond, serif", marginBottom: "0.3rem" }}>Checkout</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--grey)", marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
            Complete your order below
          </p>

          {/* Saved Addresses Section */}
          {savedAddresses.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--grey)", marginBottom: "0.75rem", fontWeight: 600 }}>
                Select a Saved Address
              </p>
              <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.75rem" }}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      style={{
                        minWidth: "220px",
                        maxWidth: "220px",
                        background: isSelected ? "rgba(226, 184, 127, 0.08)" : "var(--card-bg)",
                        border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "14px",
                        padding: "1rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.62rem", textTransform: "uppercase", background: "rgba(226, 184, 127, 0.15)", color: "var(--accent)", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: 600 }}>
                          {addr.label}
                        </span>
                        {isSelected && (
                          <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "var(--success)", color: "#09090b", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✓</span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--white)", margin: "0 0 0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {addr.fullName}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--grey)", margin: "0 0 0.2rem" }}>
                        📞 {addr.phone}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--grey)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "1.3" }}>
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--grey)", marginBottom: "1rem", fontWeight: 600 }}>
            {savedAddresses.length > 0 ? "Or Enter Shipping Details" : "Delivery Address"}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
            {[
              { name: "fullName", placeholder: "Full Name" },
              { name: "phone", placeholder: "Phone Number" },
              { name: "street", placeholder: "Street Address", full: true },
              { name: "city", placeholder: "City" },
              { name: "state", placeholder: "State" },
              { name: "pincode", placeholder: "Pincode" },
            ].map(({ name, placeholder, full }) => (
              <input
                key={name}
                name={name}
                placeholder={placeholder}
                value={address[name]}
                onChange={handleChange}
                style={{
                  gridColumn: full ? "1 / -1" : "auto",
                  background: "rgba(0,0,0,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "0.85rem 1rem",
                  fontSize: "0.88rem",
                  color: "var(--white)",
                  outline: "none",
                  width: "100%",
                  fontFamily: "Inter, sans-serif"
                }}
              />
            ))}
          </div>

          {/* Save Address to Profile Checkbox */}
          {!selectedAddressId && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "-1.25rem", marginBottom: "2rem" }}>
              <input
                type="checkbox"
                id="saveToProfileCheckout"
                checked={saveToProfile}
                onChange={e => setSaveToProfile(e.target.checked)}
                style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--accent)" }}
              />
              <label htmlFor="saveToProfileCheckout" style={{ fontSize: "0.82rem", color: "var(--grey)", cursor: "pointer", userSelect: "none" }}>
                Save this address to my profile for future purchases
              </label>
            </div>
          )}

          <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--grey)", marginBottom: "1rem", fontWeight: 600 }}>
            Payment Method
          </p>

          {/* Payment Methods */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

            {/* COD */}
            <div
              onClick={() => setPaymentMethod("COD")}
              style={{
                display: "flex", alignItems: "center", gap: "1rem",
                background: paymentMethod === "COD" ? "rgba(226, 184, 127, 0.08)" : "var(--card-bg)",
                border: `1px solid ${paymentMethod === "COD" ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "14px", padding: "1rem 1.25rem", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>💵</span>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--white)", margin: 0 }}>Cash on Delivery</p>
                <p style={{ fontSize: "0.78rem", color: "var(--grey)", margin: 0 }}>Pay when delivered</p>
              </div>
              {paymentMethod === "COD" && (
                <span style={{ marginLeft: "auto", width: "20px", height: "20px", borderRadius: "50%", background: "var(--success)", color: "#09090b", fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✓</span>
              )}
            </div>

            {/* Razorpay */}
            <div
              onClick={() => setPaymentMethod("Razorpay")}
              style={{
                display: "flex", alignItems: "center", gap: "1rem",
                background: paymentMethod === "Razorpay" ? "rgba(226, 184, 127, 0.08)" : "var(--card-bg)",
                border: `1px solid ${paymentMethod === "Razorpay" ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "14px", padding: "1rem 1.25rem", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>💳</span>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--white)", margin: 0 }}>Pay Online</p>
                <p style={{ fontSize: "0.78rem", color: "var(--grey)", margin: 0 }}>UPI, Cards, Netbanking</p>
              </div>
              {paymentMethod === "Razorpay" && (
                <span style={{ marginLeft: "auto", width: "20px", height: "20px", borderRadius: "50%", background: "var(--success)", color: "#09090b", fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✓</span>
              )}
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={paymentMethod === "Razorpay" ? handleRazorpayPayment : handlePlaceOrder}
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: loading ? "rgba(255,255,255,0.2)" : "var(--accent)",
              color: "var(--black)",
              border: "none",
              borderRadius: "980px",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "1.5rem",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s ease"
            }}
          >
            {loading ? "Processing..." : paymentMethod === "Razorpay" ? "💳 Pay Now" : "Place Order"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--grey)", marginTop: "1rem" }}>
            🔒 Secure & encrypted checkout
          </p>
        </div>

        {/* Right — Order Summary */}
        <div style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "1.5rem",
          position: "sticky",
          top: "100px"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--white)", marginBottom: "1.25rem", fontFamily: "Cormorant Garamond, serif" }}>Order Summary</h3>
          
          {/* Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "200px", overflowY: "auto", marginBottom: "1.25rem" }}>
            {items.map((item) => (
              <div key={item._id} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <img src={item.image} alt={item.name} style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 500, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--grey)" }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "var(--white)" }}>₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.25rem" }} />

          {/* Promo Code Input */}
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--grey)", marginBottom: "0.5rem" }}>Apply Promo Code</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                type="text" 
                placeholder="e.g. DEAL20" 
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                disabled={!!appliedCoupon}
                style={{
                  flex: 1, background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)",
                  borderRadius: "8px", padding: "0.5rem 0.75rem", fontSize: "0.82rem",
                  color: "var(--white)", outline: "none"
                }}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!!appliedCoupon}
                style={{
                  background: appliedCoupon ? "rgba(255,255,255,0.1)" : "var(--accent)",
                  color: appliedCoupon ? "var(--grey)" : "var(--black)",
                  border: "none", borderRadius: "8px", padding: "0.5rem 1rem",
                  fontSize: "0.82rem", fontWeight: 600, cursor: appliedCoupon ? "not-allowed" : "pointer"
                }}
              >
                {appliedCoupon ? "Applied" : "Apply"}
              </button>
            </div>
            {appliedCoupon && (
              <p style={{ fontSize: "0.75rem", color: "var(--success)", margin: "0.4rem 0 0", display: "flex", justifyContent: "space-between" }}>
                <span>✓ Coupon applied</span>
                <span onClick={() => { setAppliedCoupon(""); setDiscountAmount(0); }} style={{ textDecoration: "underline", cursor: "pointer", color: "var(--error)" }}>Remove</span>
              </p>
            )}
          </div>

          <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.25rem" }} />

          {/* Breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--grey)" }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--success)" }}>
                <span>Discount ({appliedCoupon})</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--grey)" }}>
              <span>Delivery</span>
              <span style={{ color: "var(--success)" }}>FREE</span>
            </div>
            <div style={{ height: "1px", background: "var(--border)", margin: "0.4rem 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, color: "var(--white)" }}>
              <span>Total</span>
              <span style={{ color: "var(--accent)" }}>₹{Math.max(0, subtotal - discountAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;