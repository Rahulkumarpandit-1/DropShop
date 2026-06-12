import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
    } else {
      toast.error("Invalid or missing reset token");
      navigate("/");
    }
  }, [location, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password || !form.confirmPassword) {
      return toast.error("All fields are required");
    }

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        toast.success("Password reset successfully!");
        navigate("/");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        background: "#09090b",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 1rem 4rem",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #1c1c1e, #161618)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "3rem 2.5rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)"
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "1.4rem",
              fontWeight: 600,
              color: "#f5f5f7",
              margin: "0 0 0.2rem"
            }}
          >
            DropShop<span style={{ color: "#e8d5b7" }}>.</span>
          </p>
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "2.2rem",
              fontWeight: 600,
              color: "#f5f5f7",
              margin: "0.5rem 0 0.5rem",
              letterSpacing: "-0.02em"
            }}
          >
            Create New Password
          </h2>
          <p style={{ fontSize: "0.88rem", color: "#86868b", margin: 0 }}>
            Enter your new secure password below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#86868b",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.5rem"
              }}
            >
              New Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "0.9rem 1.1rem",
                fontSize: "0.9rem",
                color: "#f5f5f7",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#86868b",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.5rem"
              }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "0.9rem 1.1rem",
                fontSize: "0.9rem",
                color: "#f5f5f7",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "rgba(255,255,255,0.3)" : "#f5f5f7",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "980px",
              padding: "0.95rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "1rem",
              transition: "background 0.2s ease, transform 0.1s ease"
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#e8d5b7";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "#f5f5f7";
            }}
            onMouseDown={(e) => {
              if (!loading) e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? "Updating password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
