import { useEffect, useState } from "react";
import { getWishlist, toggleWishlist, addToCart } from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    try {
      await toggleWishlist(id);
      toast.success("Removed from wishlist");
      setWishlist(prev => prev.filter(item => item._id !== id));
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (e, id) => {
    e.stopPropagation();
    try {
      await addToCart(id);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--white)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #f0f0f0", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--grey)", fontFamily: "Inter, sans-serif" }}>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", padding: "80px 2rem 4rem", color: "var(--white)", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "2.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", color: "var(--white)", margin: 0 }}>My Wishlist</h2>
          <span style={{ fontSize: "0.85rem", color: "var(--grey)" }}>{wishlist.length} {wishlist.length === 1 ? "item" : "items"}</span>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 0", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "24px" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>❤️</p>
            <h3 style={{ fontSize: "1.25rem", color: "var(--white)", marginBottom: "0.5rem" }}>Your wishlist is empty</h3>
            <p style={{ color: "var(--grey)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Save items you love here to find them later.</p>
            <button 
              onClick={() => navigate("/")}
              style={{ background: "var(--accent)", color: "var(--black)", border: "none", borderRadius: "980px", padding: "0.75rem 2rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 15px rgba(226, 184, 127, 0.3)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {wishlist.map((item) => {
              const discountPercent = item.originalPrice && item.originalPrice > item.price 
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
                : 0;

              return (
                <div 
                  key={item._id}
                  onClick={() => navigate(`/product/${item._id}`)}
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                  }}
                  className="premium-card"
                >
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleRemove(e, item._id)}
                    style={{
                      position: "absolute", top: "10px", right: "10px",
                      background: "rgba(9, 9, 11, 0.6)", border: "1px solid var(--border)",
                      borderRadius: "50%", width: "32px", height: "32px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--white)", cursor: "pointer", fontSize: "0.8rem",
                      zIndex: 10, backdropFilter: "blur(4px)"
                    }}
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>

                  <div style={{ position: "relative", height: "200px", background: "rgba(255, 255, 255, 0.01)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1rem" }} />
                    {item.stock === 0 && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(9, 9, 11, 0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "var(--grey)", fontWeight: 600, fontSize: "0.82rem", background: "rgba(255, 255, 255, 0.05)", padding: "0.3rem 0.85rem", borderRadius: "980px" }}>Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "1.25rem" }}>
                    <h3 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--white)", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--grey)", marginBottom: "1rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.2rem" }}>
                      {item.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
                          ₹{item.price?.toLocaleString()}
                        </p>
                        {discountPercent > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--grey)", textDecoration: "line-through" }}>₹{item.originalPrice.toLocaleString()}</span>
                            <span style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: 600 }}>{discountPercent}% OFF</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, item._id)}
                        disabled={item.stock === 0}
                        style={{
                          background: "var(--white)", color: "#09090b", border: "none",
                          borderRadius: "980px", padding: "0.45rem 1rem",
                          fontSize: "0.75rem", fontWeight: 600,
                          cursor: item.stock === 0 ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                          opacity: item.stock === 0 ? 0.4 : 1
                        }}
                      >
                        + Cart
                      </button>
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

export default Wishlist;
