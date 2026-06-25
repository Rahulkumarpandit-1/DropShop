import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../services/api";

const STEPS = [
  { label: "Placed", icon: "🛍️", desc: "Order received" },
  { label: "Confirmed", icon: "✅", desc: "Payment confirmed" },
  { label: "Shipped", icon: "📦", desc: "On the way" },
  { label: "Out for Delivery", icon: "🚚", desc: "Arriving today" },
  { label: "Delivered", icon: "🎉", desc: "Enjoy your order!" },
];

const STATUS_COLOR = {
  Placed: "#3b82f6",
  Confirmed: "#8b5cf6",
  Shipped: "#f59e0b",
  "Out for Delivery": "#f97316",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animIn, setAnimIn] = useState(false);

  // Guest phone verification state
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const fetchTrackingInfo = (phoneNum = "") => {
    setLoading(true);
    const token = localStorage.getItem("token");
    let url = `${BASE_URL}/orders/${orderId}/tracking`;
    if (phoneNum) {
      url += `?phone=${encodeURIComponent(phoneNum)}`;
    }

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    axios
      .get(url, { headers })
      .then((res) => {
        setTracking({
          ...res.data,
          history: res.data.history ?? [],
          currentStatus: res.data.currentStatus ?? "Placed",
        });
        if (phoneNum) {
          if (res.data.isGuestVerified) {
            setVerifiedPhone(phoneNum);
            setVerifyError("");
          } else {
            setVerifyError("Incorrect phone number. Please try again.");
          }
        }
        setTimeout(() => setAnimIn(true), 100);
      })
      .catch(() => setError("Could not load tracking info."))
      .finally(() => {
        setLoading(false);
        setVerifyingPhone(false);
      });
  };

  useEffect(() => {
    fetchTrackingInfo();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Direct call to cancel endpoint
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await axios.post(`${BASE_URL}/orders/${orderId}/cancel`, {}, { headers });
      if (res.data.success || res.data.message === "Order cancelled successfully") {
        alert("Order cancelled successfully!");
        fetchTrackingInfo(verifiedPhone);
      } else {
        alert(res.data.error || "Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order. Please verify authorization.");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex =
    tracking?.currentStatus === "Cancelled"
      ? -1
      : STEPS.findIndex((s) => s.label === tracking?.currentStatus);

  const progressPercent =
    currentIndex >= 0
      ? (currentIndex / (STEPS.length - 1)) * 100
      : 0;

  // ── Loading ──
  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.shimbleWrap}>
            {[80, 60, 90, 50].map((w, i) => (
              <div
                key={i}
                style={{ ...s.shimble, width: `${w}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <style>{shimmerCSS}</style>
        </div>
      </div>
    );
  }

  // ── Guest Verification Overlay ──
  if (tracking?.requireVerification && !verifiedPhone) {
    return (
      <div style={s.page}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        `}</style>
        <div style={{ ...s.card, maxWidth: "450px", textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1.25rem" }}>🔒</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--white)", marginBottom: "0.5rem", fontFamily: "Cormorant Garamond, serif" }}>
            Guest Order Tracking
          </h3>
          <p style={{ color: "var(--grey)", fontSize: "0.85rem", marginBottom: "2rem", lineHeight: 1.5 }}>
            To protect personal data, please enter the 10-digit phone number associated with this order to unlock details.
          </p>

          {verifyError && (
            <div style={{ background: "rgba(255, 69, 58, 0.1)", border: "1px solid rgba(255, 69, 58, 0.2)", borderRadius: "10px", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#ff453a", marginBottom: "1.25rem" }}>
              {verifyError}
            </div>
          )}

          <input
            type="tel"
            placeholder="Enter 10-Digit Phone Number"
            maxLength={10}
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
            style={{
              width: "100%",
              background: "var(--black)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "0.85rem 1rem",
              fontSize: "0.9rem",
              color: "var(--white)",
              textAlign: "center",
              outline: "none",
              fontFamily: "Inter, sans-serif",
              marginBottom: "1.25rem",
              boxSizing: "border-box"
            }}
          />

          <button
            onClick={() => {
              if (phoneInput.length !== 10) {
                setVerifyError("Please enter a valid 10-digit phone number");
                return;
              }
              setVerifyingPhone(true);
              fetchTrackingInfo(phoneInput);
            }}
            disabled={verifyingPhone}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: verifyingPhone ? "var(--grey)" : "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "980px",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: verifyingPhone ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "background 0.2s ease"
            }}
          >
            {verifyingPhone ? "Verifying..." : "Verify & Unlock"}
          </button>

          <button style={{ ...s.backBtn, marginTop: "1.5rem", display: "inline-block", textDecoration: "underline" }} onClick={() => navigate("/")}>
            Go back to Homepage
          </button>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !tracking) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>😕</p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--white)", marginBottom: "0.5rem" }}>
            Order not found
          </h3>
          <p style={{ color: "var(--grey)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            {error || "We couldn't find this order."}
          </p>
          <button style={s.backBtn} onClick={() => navigate("/orders")}>
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }
  if (!tracking.history) {
    tracking.history = [];
  }
  const isCancelled = tracking.currentStatus === "Cancelled";

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        ${shimmerCSS}
        ${animCSS}
      `}</style>

      <div
        style={{
          ...s.card,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {/* ── Header ── */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate("/orders")}>
            ← Orders
          </button>
          <div style={s.headerRight}>
            {["Placed", "Confirmed"].includes(tracking.currentStatus) && (
              <button
                onClick={handleCancelOrder}
                style={{
                  background: "transparent", color: "var(--error)",
                  border: "1px solid var(--border)", borderRadius: "980px",
                  padding: "0.55rem 1.4rem", fontSize: "0.82rem",
                  fontWeight: 600, cursor: "pointer",
                  marginRight: "0.75rem",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--error)"; e.currentTarget.style.borderColor = "var(--error)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--error)"; }}
              >
                Cancel Order ✕
              </button>
            )}
            <span
              style={{
                ...s.statusPill,
                background: `${STATUS_COLOR[tracking.currentStatus]}18`,
                color: STATUS_COLOR[tracking.currentStatus],
                border: `1px solid ${STATUS_COLOR[tracking.currentStatus]}33`,
              }}
            >
              {isCancelled ? "❌" : "●"} {tracking.currentStatus}
            </span>
          </div>
        </div>

        {/* ── Order ID + ETA ── */}
        <div style={s.metaRow}>
          <div>
            <p style={s.metaLabel}>Order ID</p>
            <p style={s.metaValue}>#{String(tracking.orderId).slice(-8).toUpperCase()}</p>
          </div>
          {tracking.estimatedDelivery && !isCancelled && (
            <div style={{ textAlign: "right" }}>
              <p style={s.metaLabel}>Estimated Delivery</p>
              <p style={{ ...s.metaValue, color: "#22c55e" }}>
                {new Date(tracking.estimatedDelivery).toLocaleDateString("en-IN", {
                  weekday: "short", day: "numeric", month: "short",
                })}
              </p>
            </div>
          )}
        </div>

        {/* ── Cancelled Banner ── */}
        {isCancelled && (
          <div style={s.cancelBanner}>
            <span style={{ fontSize: "1.2rem" }}>❌</span>
            <div>
              <p style={{ fontWeight: 600, margin: 0, color: "#7f1d1d" }}>Order Cancelled</p>
              <p style={{ fontSize: "0.78rem", color: "#b91c1c", margin: 0 }}>
                This order has been cancelled.
              </p>
            </div>
          </div>
        )}

        {/* ── Progress Bar ── */}
        {!isCancelled && (
          <div style={s.progressSection}>
            {/* Track line */}
            <div style={s.trackLine}>
              <div
                style={{
                  ...s.trackFill,
                  width: animIn ? `${progressPercent}%` : "0%",
                  transition: "width 0.8s cubic-bezier(0.4,0,0.2,1) 0.3s",
                }}
              />
            </div>

            {/* Steps */}
            <div style={s.stepsRow}>
              {STEPS.map((step, i) => {
                const done = i <= currentIndex;
                const active = i === currentIndex;
                return (
                  <div key={step.label} style={s.stepCol}>
                    <div
                      style={{
                        ...s.stepDot,
                        background: done
                          ? STATUS_COLOR[tracking.currentStatus]
                          : "var(--black)",
                        border: active
                          ? `3px solid ${STATUS_COLOR[tracking.currentStatus]}`
                          : done
                            ? "none"
                            : "2px solid var(--border)",
                        boxShadow: active
                          ? `0 0 0 4px ${STATUS_COLOR[tracking.currentStatus]}22`
                          : "none",
                        transform: active ? "scale(1.15)" : "scale(1)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <span style={{ fontSize: active ? "1rem" : "0.85rem" }}>
                        {done ? (active ? step.icon : "✓") : ""}
                      </span>
                    </div>
                    <span
                      style={{
                        ...s.stepLabel,
                        color: done ? "var(--white)" : "var(--grey)",
                        fontWeight: active ? 700 : done ? 500 : 400,
                      }}
                    >
                      {step.label}
                    </span>
                    {active && (
                      <span style={s.stepDesc}>{step.desc}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Shipment & Address details ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1.5rem 0" }}>
          {/* Delivery Address */}
          <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)", padding: "1.25rem", borderRadius: "14px" }}>
            <h4 style={{ fontSize: "0.72rem", color: "var(--grey)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", fontWeight: 600 }}>
              Delivery Address
            </h4>
            {tracking.address ? (
              <>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--white)", marginBottom: "0.2rem" }}>
                  {tracking.address.fullName}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--grey)", marginBottom: "0.4rem" }}>
                  📞 {tracking.address.phone}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--grey)", margin: 0, lineHeight: "1.4" }}>
                  {tracking.address.street},<br />
                  {tracking.address.city}, {tracking.address.state} - {tracking.address.pincode}
                </p>
              </>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "var(--grey)", margin: 0 }}>No delivery address recorded.</p>
            )}
          </div>

          {/* How it will be delivered */}
          <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)", padding: "1.25rem", borderRadius: "14px" }}>
            <h4 style={{ fontSize: "0.72rem", color: "var(--grey)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", fontWeight: 600 }}>
              Shipment Details
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <span style={{ fontSize: "0.65rem", color: "var(--grey)", display: "block" }}>CARRIER</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--grey)" }}>DropShop Express Courier</span>
              </div>
              <div>
                <span style={{ fontSize: "0.65rem", color: "var(--grey)", display: "block" }}>TRACKING ID</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--grey)" }}>
                  DS-{String(tracking.orderId).slice(-6).toUpperCase()}-IN
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.65rem", color: "var(--grey)", display: "block" }}>SHIPPING MODE</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--white)" }}>Standard Secured Delivery</span>
              </div>
            </div>
          </div>
          </div>

          {/* Package Items */}
          {tracking.items && tracking.items.length > 0 && (
            <div style={{ margin: "1.5rem 0", background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)", padding: "1.25rem", borderRadius: "14px" }}>
              <h4 style={{ fontSize: "0.72rem", color: "var(--grey)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", fontWeight: 600 }}>
                Package Items ({tracking.items.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "180px", overflowY: "auto", paddingRight: "0.25rem" }}>
                {tracking.items.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}
                      />
                    )}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--white)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: "0.7rem", color: "var(--grey)", margin: 0 }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--white)", margin: 0 }}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ height: "1px", background: "var(--border)", margin: "0.75rem 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--grey)" }}>Total Amount ({tracking.paymentMethod || "COD"})</span>
                <span style={{ fontWeight: 700, color: "var(--accent)" }}>₹{tracking.total?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          <div style={s.divider} />

          {/* ── History ── */}
          <div>
            <h3 style={s.sectionTitle}>Activity Log</h3>
            {tracking.history.length === 0 ? (
              <p style={{ color: "var(--grey)", fontSize: "0.85rem" }}>No activity yet.</p>
            ) : (
              <div style={s.historyList}>
                {[...tracking.history].reverse().map((h, i) => (
                  <div
                    key={i}
                    style={{
                      ...s.historyItem,
                      opacity: animIn ? 1 : 0,
                      transform: animIn ? "translateX(0)" : "translateX(-10px)",
                      transition: `opacity 0.35s ease ${0.2 + i * 0.07}s, transform 0.35s ease ${0.2 + i * 0.07}s`,
                    }}
                  >
                    {/* Timeline dot */}
                    <div style={s.timelineCol}>
                      <div
                        style={{
                          ...s.timelineDot,
                          background:
                            i === 0
                              ? STATUS_COLOR[h.status] || "var(--accent)"
                              : "var(--border)",
                        }}
                      />
                      {i < tracking.history.length - 1 && (
                        <div style={s.timelineLine} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={s.historyContent}>
                      <div style={s.historyTop}>
                        <span
                          style={{
                            ...s.historyStatus,
                            color: STATUS_COLOR[h.status] || "var(--white)",
                          }}
                        >
                          {h.status}
                        </span>
                        <span style={s.historyTime}>
                          {new Date(h.timestamp).toLocaleString("en-IN", {
                            day: "numeric", month: "short",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p style={s.historyMsg}>{h.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Help Footer ── */}
          <div style={s.helpFooter}>
            <span style={{ fontSize: "0.82rem", color: "var(--grey)" }}>
              Need help?{" "}
              <span
                style={{ color: "var(--white)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/support")}
              >
                Contact Support
              </span>
            </span>
          </div>
        </div>
      </div>
      );
}

      // ─── Styles ───────────────────────────────────────────
      const s = {
        page: {
        minHeight: "100vh",
      background: "var(--black)",
      padding: "100px 1.5rem 4rem",
      fontFamily: "'Inter', sans-serif",
      color: "var(--white)",
  },
      card: {
        maxWidth: "680px",
      margin: "0 auto",
      background: "var(--card-bg)",
      borderRadius: "24px",
      padding: "2rem",
      boxShadow: "0 15px 35px rgba(0,0,0,0.04)",
      border: "1px solid var(--border)",
  },

      // Header
      header: {
        display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
  },
      backBtn: {
        background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "0.82rem",
      color: "var(--grey)",
      fontFamily: "'Inter', sans-serif",
      padding: 0,
      fontWeight: 500,
      transition: "color 0.2s ease",
  },
      headerRight: {display: "flex", alignItems: "center", gap: "0.5rem" },
      statusPill: {
        fontSize: "0.78rem",
      fontWeight: 600,
      padding: "0.35rem 0.95rem",
      borderRadius: "980px",
      fontFamily: "'Inter', sans-serif",
  },

      // Meta
      metaRow: {
        display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: "1.5rem",
  },
      metaLabel: {
        fontSize: "0.72rem",
      color: "var(--grey)",
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      margin: "0 0 0.2rem",
      fontWeight: 600,
  },
      metaValue: {
        fontSize: "1rem",
      fontWeight: 700,
      color: "var(--white)",
      margin: 0,
      fontFamily: "'Cormorant Garamond', serif",
  },

      // Cancelled
      cancelBanner: {
        display: "flex",
      alignItems: "center",
      gap: "0.85rem",
      background: "rgba(255, 69, 58, 0.06)",
      border: "1px solid rgba(255, 69, 58, 0.15)",
      borderRadius: "14px",
      padding: "1rem 1.25rem",
      marginBottom: "1.5rem",
  },

      // Progress
      progressSection: {marginBottom: "2rem", position: "relative" },
      trackLine: {
        position: "absolute",
      top: "20px",
      left: "10%",
      right: "10%",
      height: "3px",
      background: "var(--border)",
      borderRadius: "4px",
      zIndex: 0,
  },
      trackFill: {
        height: "100%",
      background: "linear-gradient(90deg, var(--accent), var(--success))",
      borderRadius: "4px",
      zIndex: 1,
  },
      stepsRow: {
        display: "flex",
      justifyContent: "space-between",
      position: "relative",
      zIndex: 2,
      paddingTop: "0",
  },
      stepCol: {
        display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
      gap: "0.4rem",
  },
      stepDot: {
        width: "40px",
      height: "40px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.9rem",
      color: "#fff",
  },
      stepLabel: {
        fontSize: "0.68rem",
      textAlign: "center",
      fontFamily: "'Inter', sans-serif",
      lineHeight: 1.3,
  },
      stepDesc: {
        fontSize: "0.6rem",
      color: "var(--grey)",
      textAlign: "center",
      fontStyle: "italic",
  },

      // Divider
      divider: {
        height: "1px",
      background: "var(--border)",
      margin: "1.5rem 0",
  },

      // History
      sectionTitle: {
        fontFamily: "'Cormorant Garamond', serif",
      fontSize: "1.1rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--accent)",
      margin: "0 0 1.25rem",
  },
      historyList: {display: "flex", flexDirection: "column" },
      historyItem: {
        display: "flex",
      gap: "1rem",
      paddingBottom: "1.25rem",
  },
      timelineCol: {
        display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexShrink: 0,
      width: "12px",
  },
      timelineDot: {
        width: "10px",
      height: "10px",
      borderRadius: "50%",
      flexShrink: 0,
      marginTop: "4px",
  },
      timelineLine: {
        width: "2px",
      flex: 1,
      background: "var(--border)",
      marginTop: "4px",
      minHeight: "20px",
  },
      historyContent: {flex: 1, paddingBottom: "0.25rem" },
      historyTop: {
        display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "0.2rem",
  },
      historyStatus: {
        fontSize: "0.85rem",
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
  },
      historyTime: {
        fontSize: "0.72rem",
      color: "var(--grey)",
  },
      historyMsg: {
        fontSize: "0.8rem",
      color: "var(--grey)",
      margin: 0,
      lineHeight: 1.5,
  },

      // Help footer
      helpFooter: {
        marginTop: "1.5rem",
      paddingTop: "1.25rem",
      borderTop: "1px solid var(--border)",
      textAlign: "center",
  },

      // Shimmer skeleton
      shimbleWrap: {display: "flex", flexDirection: "column", gap: "1rem" },
      shimble: {
        height: "18px",
      borderRadius: "8px",
      background: "linear-gradient(90deg, var(--black) 25%, var(--border) 50%, var(--black) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
  },
};

      const shimmerCSS = `
      @keyframes shimmer {
        0 % { background- position: 200% 0; }
      100% {background - position: -200% 0; }
  }
      `;

      const animCSS = `
      @keyframes fadeUp {
        from {opacity: 0; transform: translateY(16px); }
      to   {opacity: 1; transform: translateY(0); }
  }
      `;