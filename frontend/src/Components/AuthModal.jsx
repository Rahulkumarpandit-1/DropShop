import { useState } from "react";
import { BASE_URL } from "../services/api";

function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleClose = () => {
    setIsForgot(false);
    setIsLogin(true);
    onClose();
  };

  const handleSubmit = async () => {
    const url = isLogin
      ? `${BASE_URL}/auth/login`
      : `${BASE_URL}/auth/register`;

    const body = isLogin ? { phone: form.phone, password: form.password } : form;

    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) { alert(data.message || "Something went wrong"); return; }

      if (data.token) {
        localStorage.setItem("token", data.token);
        onSuccess?.();
        handleClose();
      } else {
        alert(data.message || "Done");
      }
    } catch (err) {
      setLoading(false);
      alert("Something went wrong");
    }
  };

  const handleForgotPasswordSubmit = async () => {
    if (!form.email) {
      alert("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      setLoading(false);
      alert(data.message || "Reset link sent!");
      if (res.ok) {
        setIsForgot(false);
        setIsLogin(true);
      }
    } catch (err) {
      setLoading(false);
      alert("Something went wrong");
    }
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 10003,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "linear-gradient(145deg, #1c1c1e, #161618)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "28px",
          padding: "2.5rem",
          width: "100%", maxWidth: "400px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)"
        }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: "1.25rem", right: "1.25rem",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%", width: "32px", height: "32px",
            color: "#86868b", fontSize: "0.8rem",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#f5f5f7"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#86868b"; }}
        >✕</button>

        {/* Logo */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "1.4rem", fontWeight: 600,
            color: "#f5f5f7", marginBottom: "0.1rem"
          }}>
            DropShop<span style={{ color: "#e8d5b7" }}>.</span>
          </p>
          <h2 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "2rem", fontWeight: 600,
            color: "#f5f5f7", margin: "0.5rem 0 0.3rem",
            letterSpacing: "-0.02em"
          }}>
            {isForgot ? "Forgot Password." : isLogin ? "Welcome back." : "Create account."}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#86868b", margin: 0 }}>
            {isForgot ? "Enter your email to receive a reset link." : isLogin ? "Sign in to continue shopping." : "Join DropShop today."}
          </p>
        </div>

        {/* Toggle tabs */}
        {!isForgot && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "12px", padding: "4px",
            marginBottom: "1.5rem"
          }}>
            {["Sign In", "Register"].map((tab) => (
              <button
                key={tab}
                onClick={() => setIsLogin(tab === "Sign In")}
                style={{
                  background: (isLogin && tab === "Sign In") || (!isLogin && tab === "Register")
                    ? "#f5f5f7" : "transparent",
                  color: (isLogin && tab === "Sign In") || (!isLogin && tab === "Register")
                    ? "#0a0a0a" : "#86868b",
                  border: "none", borderRadius: "9px",
                  padding: "0.55rem", fontSize: "0.82rem",
                  fontWeight: 500, cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s ease"
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {!isLogin && !isForgot && (
            <input
              type="text" name="name" placeholder="Full Name"
              onChange={handleChange}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "0.85rem 1rem",
                fontSize: "0.88rem", color: "#f5f5f7",
                outline: "none", fontFamily: "Inter, sans-serif",
                transition: "border-color 0.2s ease"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          )}
          {isForgot ? (
            <input
              type="email" name="email" placeholder="Email"
              onChange={handleChange}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "0.85rem 1rem",
                fontSize: "0.88rem", color: "#f5f5f7",
                outline: "none", fontFamily: "Inter, sans-serif",
                transition: "border-color 0.2s ease"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          ) : (
            <input
              type="tel" name="phone" placeholder="Phone Number"
              onChange={handleChange}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "0.85rem 1rem",
                fontSize: "0.88rem", color: "#f5f5f7",
                outline: "none", fontFamily: "Inter, sans-serif",
                transition: "border-color 0.2s ease"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          )}
          {!isForgot && (
            <input
              type="password" name="password" placeholder="Password"
              onChange={handleChange}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "0.85rem 1rem",
                fontSize: "0.88rem", color: "#f5f5f7",
                outline: "none", fontFamily: "Inter, sans-serif",
                transition: "border-color 0.2s ease"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          )}
          {isLogin && !isForgot && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-0.25rem" }}>
              <span
                onClick={() => setIsForgot(true)}
                style={{ fontSize: "0.78rem", color: "#e8d5b7", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}
              >
                Forgot Password?
              </span>
            </div>
          )}
        </div>

        {!isForgot && (
          <>
            {/* Google Login Button */}
            <button
              onClick={() => window.location.href = `${BASE_URL}/auth/google`}
              style={{
                width: "100%", padding: "0.85rem",
                background: "#fff", color: "#111",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "980px", fontSize: "0.88rem",
                fontWeight: 500, cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "0.75rem",
                marginBottom: "1rem",
                transition: "background 0.2s ease"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "0.75rem", color: "#86868b" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>
          </>
        )}

        {/* Submit */}
        <button
          onClick={isForgot ? handleForgotPasswordSubmit : handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "0.9rem",
            background: loading ? "rgba(255,255,255,0.3)" : "#f5f5f7",
            color: "#0a0a0a", border: "none",
            borderRadius: "980px", fontSize: "0.88rem",
            fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "background 0.2s ease, transform 0.1s ease",
            marginBottom: "1rem"
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#e8d5b7"; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#f5f5f7"; }}
          onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {loading ? "Please wait..." : isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
        </button>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#86868b" }}>
          {isForgot ? (
            <>
              Remembered your password?{" "}
              <span
                onClick={() => { setIsForgot(false); setIsLogin(true); }}
                style={{ color: "#e8d5b7", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                Sign In
              </span>
            </>
          ) : isLogin ? (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => setIsLogin(false)}
                style={{ color: "#e8d5b7", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setIsLogin(true)}
                style={{ color: "#e8d5b7", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                Sign In
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthModal;