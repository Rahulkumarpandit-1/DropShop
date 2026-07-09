import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ 
  product, 
  wishlist = [], 
  onToggleWishlist, 
  onAddToCart,
  addedId
}) => {
  const navigate = useNavigate();

  const isWishlisted = wishlist.includes(product._id);
  const isAdded = addedId === product._id;
  const isOutOfStock = product.stock === 0;
  const hasLowStock = product.stock > 0 && product.stock <= 5;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleCardClick = () => {
    // Add to recently viewed in localStorage
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updatedViewed = [product, ...recentlyViewed.filter(p => p._id !== product._id)].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
    navigate(`/product/${product._id}`);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    // In a full implementation this would open a modal
    handleCardClick(); 
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
      className="premium-card relative bg-card-bg border border-border rounded-[24px] overflow-hidden flex flex-col group cursor-pointer"
      onClick={handleCardClick}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Image Wrap */}
      <div 
        className="product-img-wrap"
        style={{
          position: "relative",
          background: "var(--bg-primary)", // slightly contrasting background
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid var(--border)",
          overflow: "hidden"
        }}
      >
        <motion.img 
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          src={product.image} 
          alt={product.name} 
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1.5rem" }} 
        />
        
        {/* Badges */}
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {isOutOfStock ? (
            <span style={{ background: "var(--glass-bg)", backdropFilter: "blur(4px)", color: "var(--white)", fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "980px", border: "1px solid var(--glass-border)" }}>OUT OF STOCK</span>
          ) : hasLowStock ? (
            <span style={{ background: "rgba(226,184,127,0.15)", color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "980px", border: "1px solid rgba(226,184,127,0.3)" }}>ONLY {product.stock} LEFT</span>
          ) : product.isNew ? (
            <span style={{ background: "var(--text-primary)", color: "var(--bg-primary)", fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "980px" }}>NEW</span>
          ) : null}
          
          {hasDiscount && (
             <span style={{ background: "var(--success)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "980px" }}>-{discountPercent}%</span>
          )}
        </div>

        {/* Hover Actions (Quick View & Wishlist) */}
        <div 
          className="card-actions"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            opacity: 1, // Visible by default on mobile, can hide via CSS on desktop
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => onToggleWishlist(e, product._id)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--glass-bg)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isWishlisted ? "var(--error)" : "var(--text-primary)",
              transition: "color 0.2s"
            }}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={isWishlisted ? 0 : 2} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickView}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--glass-bg)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary)"
            }}
          >
            <Eye size={18} />
          </motion.button>
        </div>
      </div>

      {/* Body */}
      <div className="product-card-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Rating (Mocked if not present) */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "0.5rem" }}>
          <Star size={12} fill="var(--accent)" color="var(--accent)" />
          <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 600 }}>{product.rating || 4.5}</span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>({product.numReviews || ((product._id?.charCodeAt(0) || 0) % 200) + 10})</span>
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 0.4rem", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.name}
        </h3>
        
        <p className="product-desc" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
          {product.description}
        </p>
        
        {/* Price & Add to Cart */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {hasDiscount && (
               <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textDecoration: "line-through", marginBottom: "2px" }}>
                 ₹{product.originalPrice.toLocaleString()}
               </span>
            )}
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              ₹{product.price?.toLocaleString()}
            </span>
          </div>
          
          <motion.button
            whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
            onClick={(e) => onAddToCart(e, product._id)}
            disabled={isOutOfStock}
            style={{
              background: isAdded ? "var(--success)" : "var(--text-primary)",
              color: "var(--bg-primary)",
              border: "none",
              borderRadius: "980px",
              padding: "0.55rem 1.2rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: isOutOfStock ? 0.4 : 1,
              transition: "background 0.2s ease"
            }}
          >
            {isAdded ? (
              <>✓ Added</>
            ) : (
              <>
                <ShoppingBag size={14} />
                Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
