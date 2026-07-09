import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  "Apple", "Samsung", "Nike", "Adidas", "Sony", "Levi's", "Puma", "Bose", "Dyson", "Gucci"
];

const FeaturedBrands = () => {
  return (
    <section className="home-section" style={{ margin: "4rem 0", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          Trusted By The Best
        </p>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
          Featured Brands
        </h2>
      </div>

      <div style={{ 
        position: "relative",
        width: "100%",
        padding: "2rem 0",
        background: "var(--card-bg)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        overflow: "hidden"
      }}>
        {/* Marquee Animation */}
        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          style={{ display: "flex", gap: "4rem", whiteSpace: "nowrap" }}
        >
          {/* Duplicate list to make infinite scroll smooth */}
          {[...brands, ...brands, ...brands].map((brand, idx) => (
            <div 
              key={idx}
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                opacity: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "Inter, sans-serif"
              }}
            >
              {brand}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedBrands;
