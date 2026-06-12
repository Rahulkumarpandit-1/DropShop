import { useEffect, useState } from "react";
import { getOrders, cancelOrder } from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await cancelOrder(orderId);
      if (res.success) {
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
    const data = await getOrders();
    setOrders(data.orders || []);
    setLoading(false);
  };

  const statusColor = (status) => {
    switch (status) {
      case "Placed": return { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" };
      case "Shipped": return { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" };
      case "Delivered": return { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" };
      case "Cancelled": return { bg: "#ffebee", color: "#c62828", border: "#ef9a9a" };
      default: return { bg: "#f5f5f5", color: "#555", border: "#ddd" };
    }
  };

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", padding: "80px 2rem 4rem", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "0.3rem" }}>
                Your Account
              </p>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#111", margin: 0 }}>
                My Orders
              </h2>
            </div>
            <span style={{ background: "#f0f0f0", color: "#555", fontSize: "0.82rem", fontWeight: 600, padding: "0.35rem 1rem", borderRadius: "980px" }}>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", border: "1px solid #f0f0f0" }}>
                <div style={{ height: "14px", background: "#f0f0f0", borderRadius: "6px", width: "40%", marginBottom: "1rem" }} />
                <div style={{ height: "12px", background: "#f0f0f0", borderRadius: "6px", width: "70%" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <p style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>
              No orders yet
            </h3>
            <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Looks like you haven't placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "#111", color: "#fff",
                border: "none", borderRadius: "980px",
                padding: "0.85rem 2rem", fontSize: "0.88rem",
                fontWeight: 600, cursor: "pointer",
                fontFamily: "Inter, sans-serif"
              }}
            >Start Shopping →</button>
          </div>
        )}
    
        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.map((order) => {
              const sc = statusColor(order.status);
              return (
                <div key={order._id} style={{
                  background: "#fff",
                  border: "1px solid #f0f0f0",
                  borderRadius: "20px",
                  padding: "1.5rem",
                  transition: "box-shadow 0.2s ease"
                }}
                
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                >
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                      <button 
                        onClick={() => navigate(`/orders/${order._id}/tracking`)}
                        style={{
                          background: "#111", color: "#fff",
                          border: "none", borderRadius: "8px",
                          padding: "0.5rem 1.25rem", fontSize: "0.82rem",
                          fontWeight: 600, cursor: "pointer",
                          fontFamily: "Inter, sans-serif"
                        }}
                      >
                        Track Order 🚚
                      </button>
                      {["Placed", "Confirmed"].includes(order.status) && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          style={{
                            background: "#ffebee", color: "#c62828",
                            border: "1px solid #ef9a9a", borderRadius: "8px",
                            padding: "0.5rem 1.25rem", fontSize: "0.82rem",
                            fontWeight: 600, cursor: "pointer",
                            fontFamily: "Inter, sans-serif"
                          }}
                        >
                          Cancel Order ✕
                        </button>
                      )}
                    </div>
                  {/* Order Meta */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: "0.3rem" }}>
                        Order ID
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "#555", fontFamily: "monospace", background: "#f5f5f5", padding: "0.25rem 0.6rem", borderRadius: "6px", display: "inline-block" }}>
                        {order._id}
                      </p>
                    </div>
                    <span style={{
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                      padding: "0.35rem 1rem",
                      borderRadius: "980px",
                      fontSize: "0.75rem",
                      fontWeight: 600
                    }}>
                      {order.status === "Placed" ? "✓ " : ""}{order.status}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: "#f5f5f5", marginBottom: "1.25rem" }} />

                  {/* Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
                    {order.items.map((item) => (
                      <div key={item._id} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "60px", height: "60px", background: "#f8f8f8", borderRadius: "12px", overflow: "hidden", flexShrink: 0, border: "1px solid #f0f0f0" }}>
                          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "6px" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.88rem", color: "#111", fontWeight: 600, margin: "0 0 0.2rem" }}>{item.name}</p>
                          <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>Qty: {item.quantity}</p>
                        </div>
                        <p style={{ fontSize: "0.95rem", color: "#111", fontWeight: 700 }}>₹{item.price?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: "#f5f5f5", marginBottom: "1.25rem" }} />

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1rem" }}>{order.paymentMethod === "COD" ? "💵" : "💳"}</span>
                      <p style={{ fontSize: "0.78rem", color: "#999", margin: 0 }}>{order.paymentMethod}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.7rem", color: "#999", margin: "0 0 0.2rem" }}>Order Total</p>
                      <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111", margin: 0 }}>₹{order.total?.toLocaleString()}</p>
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