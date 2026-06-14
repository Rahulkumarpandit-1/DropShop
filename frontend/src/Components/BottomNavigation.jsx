import { useLocation, useNavigate } from "react-router-dom";

function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { label: "Home", path: "/", icon: "🏠" },
    { label: "Shop", path: "/products", icon: "🛍️" },
    { label: "Wishlist", path: "/wishlist", icon: "❤️" },
    { label: "Cart", path: "/cart", icon: "🛒" },
    { label: "Profile", path: "/profile", icon: "👤" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <div 
          key={item.label}
          onClick={() => navigate(item.path)}
          className={`mobile-bottom-nav__item ${isActive(item.path) ? "active" : ""}`}
        >
          <span className="mobile-bottom-nav__icon">{item.icon}</span>
          <span className="mobile-bottom-nav__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default BottomNavigation;
