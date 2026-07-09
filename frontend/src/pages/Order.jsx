import { useEffect, useState } from "react";
import { getOrders, cancelOrder } from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await cancelOrder(orderId);
      if (res.success || res.message === "Order cancelled successfully") {
        toast.success("Order cancelled successfully!");
        fetchOrders();
      } else {
        toast.error(res.error || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error("An error occurred while cancelling the order");
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case "Placed":
        return { bg: "rgba(184, 134, 11, 0.08)", color: "var(--accent)", border: "rgba(184, 134, 11, 0.2)" };
      case "Confirmed":
        return { bg: "rgba(48, 209, 88, 0.08)", color: "var(--success)", border: "rgba(48, 209, 88, 0.2)" };
      case "Shipped":
        return { bg: "rgba(10, 132, 255, 0.08)", color: "#0a84ff", border: "rgba(10, 132, 255, 0.2)" };
      case "Delivered":
        return { bg: "rgba(48, 209, 88, 0.08)", color: "var(--success)", border: "rgba(48, 209, 88, 0.2)" };
      case "Cancelled":
        return { bg: "rgba(255, 69, 58, 0.08)", color: "var(--error)", border: "rgba(255, 69, 58, 0.2)" };
      default:
        return { bg: "rgba(255, 255, 255, 0.05)", color: "var(--grey)", border: "var(--border)" };
    }
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", padding: "100px 2rem 4rem", color: "var(--white)", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--grey)", marginBottom: "0.4rem", fontWeight: 600 }}>
                Your Account
              </p>
              <h2 style={{ fontSize: "2.4rem", fontWeight: 600, color: "var(--white)", margin: 0, fontFamily: "Outfit", sans-serif" }}>
                My Orders
              </h2>
            </div>
            <span style={{ background: "var(--card-bg)", color: "var(--grey)", border: "1px solid var(--border)", fontSize: "0.82rem", fontWeight: 600, padding: "0.4rem 1.25rem", borderRadius: "980px" }}>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: "var(--card-bg)", borderRadius: "24px", padding: "2rem", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.01)" }}>
                <div style={{ height: "16px", background: "var(--black)", borderRadius: "6px", width: "40%", marginBottom: "1rem", border: "1px solid var(--border)" }} />
                <div style={{ height: "14px", background: "var(--black)", borderRadius: "6px", width: "70%", border: "1px solid var(--border)" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "6rem 0", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "4.5rem", marginBottom: "1rem" }}>📦</p>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--white)", marginBottom: "0.5rem", fontFamily: "Outfit", sans-serif" }}>
              No orders yet
            </h3>
            <p style={{ color: "var(--grey)", fontSize: "0.9rem", marginBottom: "2.25rem" }}>
              Looks like you haven't placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "var(--white)", color: "var(--black)",
                border: "none", borderRadius: "980px",
                padding: "0.85rem 2.5rem", fontSize: "0.88rem",
                fontWeight: 600, cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--white)"}
            >Start Shopping →</button>
          </div>
        )}
    
        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {orders.map((order) => {
              const sc = statusStyle(order.status);
              return (
                <div key={order._id} style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "24px",
                  padding: "2rem",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.02)",
                  transition: "all 0.3s ease"
                }}
                  className="orders-page-card"
                >
                  {/* Action Buttons Header */}
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                    <button 
                      onClick={() => navigate(`/orders/${order._id}/tracking`)}
                      style={{
                        background: "var(--accent)", color: "#fff",
                        border: "none", borderRadius: "980px",
                        padding: "0.6rem 1.6rem", fontSize: "0.82rem",
                        fontWeight: 600, cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(226, 184, 127, 0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      Track Order 🚚
                    </button>
                    {["Placed", "Confirmed"].includes(order.status) && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        style={{
                          background: "transparent", color: "var(--error)",
                          border: "1px solid var(--border)", borderRadius: "980px",
                          padding: "0.6rem 1.6rem", fontSize: "0.82rem",
                          fontWeight: 600, cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--error)"; e.currentTarget.style.borderColor = "var(--error)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--error)"; }}
                      >
                        Cancel Order ✕
                      </button>
                    )}
                  </div>

                  {/* Order Meta */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <p style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--grey)", marginBottom: "0.3rem", fontWeight: 600 }}>
                        Order ID
                      </p>
                      <p style={{ fontSize: "0.82rem", color: "var(--white)", fontFamily: "monospace", background: "rgba(0,0,0,0.03)", padding: "0.3rem 0.75rem", borderRadius: "8px", display: "inline-block", border: "1px solid var(--border)", margin: 0 }}>
                        {order._id}
                      </p>
                    </div>
                    <span style={{
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                      padding: "0.4rem 1.2rem",
                      borderRadius: "980px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      letterSpacing: "0.02em"
                    }}>
                      {order.status === "Placed" ? "✓ " : ""}{order.status}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.5rem" }} />

                  {/* Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
                    {(order.items || []).map((item) => (
                      <div key={item._id} style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        <div style={{ width: "70px", height: "70px", background: "rgba(0,0,0,0.02)", borderRadius: "14px", overflow: "hidden", flexShrink: 0, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "6px" }} />
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <p style={{ fontSize: "0.92rem", color: "var(--white)", fontWeight: 600, margin: "0 0 0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                          <p style={{ fontSize: "0.78rem", color: "var(--grey)", margin: 0 }}>Quantity: {item.quantity}</p>
                        </div>
                        <p style={{ fontSize: "1rem", color: "var(--white)", fontWeight: 700 }}>₹{item.price?.toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.5rem" }} />

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>{order.paymentMethod === "COD" ? "💵" : "💳"}</span>
                      <p style={{ fontSize: "0.82rem", color: "var(--grey)", margin: 0 }}>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.72rem", color: "var(--grey)", margin: "0 0 0.2rem", fontWeight: 500 }}>Total amount</p>
                      <p style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>₹{order.total?.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;