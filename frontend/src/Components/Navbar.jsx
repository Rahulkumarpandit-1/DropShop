import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import { BASE_URL, getCart } from "../services/api";


function Navbar({ selectedCategory, setSelectedCategory, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const data = await getCart();
      const count = (data.items || []).reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cart-updated", fetchCartCount);
    return () => window.removeEventListener("cart-updated", fetchCartCount);
  }, [isLoggedIn]);

  // Navbar.jsx — replace your current login check useEffect with this:
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(`${BASE_URL}/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.user) {
            setUserName(data.user.name);
            setIsLoggedIn(true);
            setUserRole(data.user.role || "user");
          } else {
            setIsLoggedIn(false);
            setUserRole("user");
          }
        } catch {
          setIsLoggedIn(false);
          setUserRole("user");
        }
      } else {
        setIsLoggedIn(false);
        setUserRole("user");
      }
    };
    checkAuth();
  }, [showAuth]); // 👈 re-runs when modal closes

  // Pass this to AuthModal
  const handleLoginSuccess = async () => {
    console.log("handleLoginSuccess called");
    const token = localStorage.getItem("token");
    console.log("token:", token);

    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      console.log("profile data:", data);
      if (data.user) {
        setUserName(data.user.name);
        setIsLoggedIn(true);
        setUserRole(data.user.role || "user");
        console.log("isLoggedIn set to true");
      }
    } catch (err) {
      console.error("Profile fetch error on login success:", err);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName("");
    setUserRole("user");
    navigate("/");
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products || []
      : (products || []).filter(
        (p) =>
          p.category &&
          p.category.toLowerCase() === selectedCategory.toLowerCase()
      );


  // initials from name
  const initials = userName
    ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";
  const [query, setQuery] = useState("");
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (!menuOpen) return; // Only listen when the menu dropdown is actually open
    const handleOutsideClick = (e) => {
      // If the clicked element is NOT part of the dropdown and NOT the toggle menu button
      if (!e.target.closest(".navbar__dropdown") && !e.target.closest(".navbar__menu-btn")) {
        setMenuOpen(false); // Close the dropdown
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [menuOpen]);

  return (
    <>

      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 10001
          }}
        />
      )}


      <div style={{
        position: "fixed",
        top: 0,
        left: isMenuOpen ? "0" : "-280px",
        width: "280px",
        height: "100%",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 10002,
        padding: "2rem 1.5rem",
        transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        boxShadow: isMenuOpen ? "0 0 50px rgba(0,0,0,0.08)" : "none"
      }}>

        {/* Close Button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: "rgba(0,0,0,0.04)",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            color: "var(--grey)",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--white)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--grey)"}
        >✕</button>

        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--white)", margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.05em" }}>
            DropShop<span style={{ color: "var(--accent)" }}>.</span>
          </h2>
          <p style={{ margin: "0.15rem 0 0", color: "var(--grey)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Navigation Menu</p>
        </div>

        {/* Drawer Mobile Search */}
        <div className="drawer-mobile-search" style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                setIsMenuOpen(false);
                navigate(`/products?search=${query}`);
              }
            }}
            style={{
              width: "100%",
              background: "rgba(0, 0, 0, 0.02)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "0.65rem 0.85rem",
              fontSize: "0.82rem",
              color: "var(--white)",
              outline: "none",
              fontFamily: "'Inter', sans-serif"
            }}
          />
        </div>

        {/* Category Section */}
        <p style={{ color: "#71717a", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Shop Departments</p>
        <div style={{ display: "flex", gap: "0.4rem", flexDirection: "column", marginBottom: "1.5rem" }}>
          {[
            { name: "All", icon: "🛍️" },
            { name: "Electronic", icon: "📱" },
            { name: "Fashion", icon: "👕" },
            { name: "Accessories", icon: "👜" },
            { name: "Home", icon: "🏠" },
            { name: "Kids", icon: "🧸" }
          ].map((cat) => (
            <div
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                setIsMenuOpen(false);
                navigate(`/products?category=${cat.name}`);
              }}
              style={{
                cursor: "pointer",
                padding: "0.65rem 1rem",
                borderRadius: "10px",
                background: selectedCategory === cat.name ? "rgba(184, 134, 11, 0.08)" : "transparent",
                color: selectedCategory === cat.name ? "var(--accent)" : "var(--grey)",
                fontWeight: selectedCategory === cat.name ? 600 : 500,
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                if (selectedCategory !== cat.name) {
                  e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                  e.currentTarget.style.color = "var(--white)";
                }
              }}
              onMouseLeave={e => {
                if (selectedCategory !== cat.name) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--grey)";
                }
              }}
            >
              <span style={{ fontSize: "1rem" }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>

        <hr style={{ borderColor: "var(--border)", margin: "0.5rem 0" }} />

        {/* Account Section */}
        <p style={{ color: "var(--grey)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "1rem 0 0.5rem" }}>Your Account</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
          <div
            onClick={() => {
              navigate("/profile");
              setIsMenuOpen(false);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 1rem", color: "var(--grey)", fontSize: "0.85rem", cursor: "pointer", borderRadius: "10px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.color = "var(--white)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--grey)" }}
          >
            <span>👤</span> Profile Settings
          </div>

          <div
            onClick={() => {
              navigate("/wishlist");
              setIsMenuOpen(false);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 1rem", color: "var(--grey)", fontSize: "0.85rem", cursor: "pointer", borderRadius: "10px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.color = "var(--white)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--grey)" }}
          >
            <span>❤️</span> My Wishlist
          </div>

          <div
            onClick={() => {
              navigate("/orders");
              setIsMenuOpen(false);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 1rem", color: "var(--grey)", fontSize: "0.85rem", cursor: "pointer", borderRadius: "10px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.color = "var(--white)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--grey)" }}
          >
            <span>📦</span> Order History
          </div>
        </div>

        {/* Drawer Footer Widget */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "auto" }}>
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "var(--accent)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.78rem", fontWeight: 700
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
                <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--grey)", textTransform: "capitalize" }}>{userRole} Account</p>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
              >Exit</button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAuth(true);
                setIsMenuOpen(false);
              }}
              style={{
                width: "100%",
                background: "var(--white)",
                color: "var(--black)",
                border: "none",
                borderRadius: "10px",
                padding: "0.65rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--white)"}
            >
              Sign In to Store
            </button>
          )}
        </div>
      </div>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">
          {/* Burger menu trigger */}
          <div
            onClick={() => setIsMenuOpen(true)}
            className="navbar__burger-btn"
            style={{
              cursor: "pointer",
              flexDirection: "column",
              gap: "4px",
              padding: "6px",
              marginRight: "0.5rem"
            }}
          >
            <div style={{ width: "18px", height: "2px", background: "var(--white)" }}></div>
            <div style={{ width: "18px", height: "2px", background: "var(--white)" }}></div>
            <div style={{ width: "18px", height: "2px", background: "var(--white)" }}></div>
          </div>

          {/* Logo */}
          <h2 style={{ cursor: "pointer", marginLeft: "0" }} className="navbar__logo" onClick={() => navigate("/")}>
            DropShop<span className="navbar__logo-dot">.</span>
          </h2>





          <div className="navbar__search-wrap">
            <span className="navbar__search-icon">⌕</span>
            <input
              type="text"
              className="navbar__search"
              placeholder="Search products..."
              value={query}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              name="search"        // 👈 name="search" prevents browser from treating it as email field
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  navigate(`/products?search=${query}`);
                }
              }}
            />
          </div>          {/* Right side */}
          <div className="navbar__actions">
            <div className="navbar__cart" onClick={() => navigate("/cart")}>
              <svg
                className="navbar__cart-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {/* Optional cart count badge */}
              {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
            </div>

            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* Avatar with initials */}
                <div
                  onClick={() => navigate("/profile")}
                  style={{
                    width: "34px", height: "34px",
                    borderRadius: "50%",
                    background: "#111", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.72rem", fontWeight: 700,
                    cursor: "pointer", border: "2px solid #e5e5e5",
                    transition: "all 0.2s ease",
                    fontFamily: "Inter, sans-serif"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#111"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e5e5"}
                  title={userName}
                >
                  {initials}
                </div>

                {/* Sign out button */}
                <button
                  onClick={handleLogout}
                  className="navbar__btn navbar__btn--ghost"
                  style={{ fontSize: "0.78rem" }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                className="navbar__btn navbar__btn--solid"
                onClick={() => setShowAuth(true)}
              >
                Sign In
              </button>
            )}

            {/* Triple dot menu */}
            <button className="navbar__menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="navbar__dropdown">
                <p onClick={() => { navigate("/"); setMenuOpen(false); }}>Home</p>
                <p onClick={() => { navigate("/cart"); setMenuOpen(false); }}>Cart</p>
                <p onClick={() => { navigate("/wishlist"); setMenuOpen(false); }}>Wishlist</p>
                <p onClick={() => { navigate("/orders"); setMenuOpen(false); }}>Your Orders</p>
                <p onClick={() => { navigate("/profile"); setMenuOpen(false); }}>Profile</p>
              </div>
            )}
          </div>

        </div>
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleLoginSuccess} />
    </>
  );
}

export default Navbar;