import React, { useRef } from 'react';
import ProductCard from '../ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCarousel = ({ title, subtitle, products, onAddToCart, onToggleWishlist, addedId, wishlist }) => {
  const sliderRef = useRef(null);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="home-section" style={{ margin: "4rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          {subtitle && (
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem" }}>
              {subtitle}
            </p>
          )}
          <h2 style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
            {title}
          </h2>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => scrollSlider("left")}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scrollSlider("right")}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={sliderRef}
        className="hide-scrollbar"
        style={{ 
          display: "flex", 
          gap: "1.5rem", 
          overflowX: "auto", 
          paddingBottom: "2rem",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {products.map((p) => (
          <div key={p._id} style={{ flex: "0 0 280px", scrollSnapAlign: "start" }}>
            <ProductCard 
              product={p}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              addedId={addedId}
              wishlist={wishlist}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;
