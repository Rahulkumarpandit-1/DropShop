import { useState, useEffect } from "react";
import { BASE_URL } from "../services/api";

function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [isForgot, setIsForgot] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "", otp: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleClose = () => {
    setIsForgot(false);
    setIsLogin(true);
    setLoginMode("password");
    setOtpSent(false);
    setTimer(0);
    setForm({ name: "", phone: "", password: "", otp: "", email: "" });
    onClose();
  };

  const handleSendOtp = async () => {
    if (!form.phone) {
      alert("Please enter your phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone })
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setTimer(30);

      if (data.code) {
        alert(`[TEST MODE] OTP code is: ${data.code}`);
      } else {
        alert("OTP sent successfully to your phone");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to send OTP. Please try again.");
    }
  };

  const handleSubmit = async () => {
    // 1. Password Login Mode
    if (isLogin && loginMode === "password") {
      if (!form.phone || !form.password) {
        alert("Phone number and Password are required");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone, password: form.password })
        });
        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
          alert(data.message || "Invalid credentials");
          return;
        }

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
      return;
    }

    // 2. OTP Login Mode
    if (isLogin && loginMode === "otp") {
      if (!form.phone) {
        alert("Phone number is required");
        return;
      }
      if (!otpSent) {
        await handleSendOtp();
        return;
      }
      if (!form.otp) {
        alert("Please enter the 6-digit OTP");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone, otp: form.otp })
        });
        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
          alert(data.message || "Invalid OTP code");
          return;
        }

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
      return;
    }

    // 3. Register Mode (Name, Phone, Password, OTP verification)
    if (!isLogin) {
      if (!form.name || !form.phone || !form.password) {
        alert("Name, phone, and password are required");
        return;
      }
      if (!otpSent) {
        await handleSendOtp();
        return;
      }
      if (!form.otp) {
        alert("Please verify your phone using the OTP");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            password: form.password,
            otp: form.otp
          })
        });
        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
          alert(data.message || "Registration failed");
          return;
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
          onSuccess?.();
          handleClose();
        } else {
          alert(data.message || "Registration successful! Please sign in.");
          handleClose();
        }
      } catch (err) {
        setLoading(false);
        alert("Something went wrong");
      }
      return;
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
                onClick={() => {
                  const toLogin = tab === "Sign In";
                  setIsLogin(toLogin);
                  setOtpSent(false);
                  setTimer(0);
                  setLoginMode("password");
                  setForm({ name: "", phone: "", password: "", otp: "", email: "" });
                }}
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
          {isForgot ? (
            <input
              type="email" name="email" placeholder="Email"
              value={form.email}
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
          ) : isLogin ? (
            // 1. SIGN IN TAB
            loginMode === "password" ? (
              // 1a. Password Sign-in
              <>
                <input
                  type="tel" name="phone" placeholder="Phone Number"
                  value={form.phone}
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
                <input
                  type="password" name="password" placeholder="Password"
                  value={form.password}
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
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-0.25rem" }}>
                  <span
                    onClick={() => setIsForgot(true)}
                    style={{ fontSize: "0.78rem", color: "#e8d5b7", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}
                  >
                    Forgot Password?
                  </span>
                </div>
              </>
            ) : (
              // 1b. OTP Sign-in
              <>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="tel" name="phone" placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    style={{
                      flex: 1,
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
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || timer > 0}
                    style={{
                      padding: "0.85rem 1rem",
                      background: timer > 0 ? "rgba(255,255,255,0.05)" : "#e8d5b7",
                      color: timer > 0 ? "#86868b" : "#0a0a0a",
                      border: "none", borderRadius: "12px",
                      fontSize: "0.82rem", fontWeight: 600,
                      cursor: (loading || timer > 0) ? "not-allowed" : "pointer",
                      fontFamily: "Inter, sans-serif",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {timer > 0 ? `${timer}s` : otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
                {otpSent && (
                  <input
                    type="text" name="otp" placeholder="6-digit OTP"
                    value={form.otp}
                    onChange={handleChange}
                    maxLength={6}
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
              </>
            )
          ) : (
            // 2. REGISTER TAB
            <>
              <input
                type="text" name="name" placeholder="Full Name"
                value={form.name}
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
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="tel" name="phone" placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  style={{
                    flex: 1,
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
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || timer > 0}
                  style={{
                    padding: "0.85rem 1rem",
                    background: timer > 0 ? "rgba(255,255,255,0.05)" : "#e8d5b7",
                    color: timer > 0 ? "#86868b" : "#0a0a0a",
                    border: "none", borderRadius: "12px",
                    fontSize: "0.82rem", fontWeight: 600,
                    cursor: (loading || timer > 0) ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease"
                  }}
                >
                  {timer > 0 ? `${timer}s` : otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
              {otpSent && (
                <input
                  type="text" name="otp" placeholder="6-digit OTP"
                  value={form.otp}
                  onChange={handleChange}
                  maxLength={6}
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
              <input
                type="password" name="password" placeholder="Password"
                value={form.password}
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
            </>
          )}
        </div>

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
          {loading 
            ? "Please wait..." 
            : isForgot 
              ? "Send Reset Link" 
              : isLogin 
                ? loginMode === "password" 
                  ? "Sign In" 
                  : "Verify & Sign In"
                : "Create Account"}
        </button>

        {/* Sub-mode option toggler (Only on login screen, not forgot password) */}
        {isLogin && !isForgot && (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <span
              onClick={() => {
                setLoginMode(loginMode === "password" ? "otp" : "password");
                setOtpSent(false);
                setTimer(0);
                setForm({ ...form, otp: "" });
              }}
              style={{ fontSize: "0.82rem", color: "#e8d5b7", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }}
            >
              {loginMode === "password" ? "Sign in with an OTP" : "Sign in with password"}
            </span>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#86868b", margin: "0.5rem 0 1.5rem" }}>
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
                onClick={() => {
                  setIsLogin(false);
                  setOtpSent(false);
                  setTimer(0);
                  setForm({ name: "", phone: "", password: "", otp: "", email: "" });
                }}
                style={{ color: "#e8d5b7", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setIsLogin(true);
                  setOtpSent(false);
                  setTimer(0);
                  setForm({ name: "", phone: "", password: "", otp: "", email: "" });
                }}
                style={{ color: "#e8d5b7", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                Sign In
              </span>
            </>
          )}
        </p>

        {/* Circular Google sign in at the very bottom (only if not forgot password) */}
        {!isForgot && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "0.75rem" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: "0.72rem", color: "#86868b" }}>or continue with</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Circular Google Icon Button */}
            <button
              onClick={() => window.location.href = `${BASE_URL}/auth/google`}
              title="Continue with Google"
              style={{
                width: "44px", height: "44px",
                background: "#fff",
                border: "none",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.background = "#f5f5f7"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#fff"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;