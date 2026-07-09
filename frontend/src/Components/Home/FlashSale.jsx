import React, { useState, useEffect } from 'react';
import ProductCarousel from './ProductCarousel';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

const FlashSale = ({ products, onAddToCart, onToggleWishlist, addedId, wishlist }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  // Add stable pseudo-random discount to products if they don't have one for the flash sale effect
  const flashSaleProducts = products.slice(0, 6).map((p, idx) => {
    if (!p.originalPrice || p.originalPrice <= p.price) {
      const discount = (idx % 2 === 0) ? 1.2 : 1.3;
      return { ...p, originalPrice: Math.round(p.price * discount) };
    }
    return p;
  });

  if (flashSaleProducts.length === 0) return null;

  return (
    <div style={{ position: "relative", padding: "1rem 0" }}>
      {/* Background Effect */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: "linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)", zIndex: -1, borderRadius: "24px" }} />
      
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", padding: "0 1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ 
              background: "var(--error)", 
              color: "#fff", 
              padding: "0.5rem", 
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)"
            }}
          >
            <Timer size={24} />
          </motion.div>
          <div>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "Inter, sans-serif", letterSpacing: "-0.03em" }}>
              Flash Sale
            </h2>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginRight: "0.5rem", fontWeight: 500 }}>Ends in:</span>
          {['hours', 'minutes', 'seconds'].map((unit, idx) => (
            <React.Fragment key={unit}>
              <div style={{ 
                background: "var(--card-bg)", 
                border: "1px solid var(--border)",
                color: "var(--error)",
                fontWeight: 700,
                fontSize: "1.2rem",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }}>
                {formatNumber(timeLeft[unit])}
              </div>
              {idx < 2 && <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>:</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <ProductCarousel 
        products={flashSaleProducts}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        addedId={addedId}
        wishlist={wishlist}
      />
    </div>
  );
};

export default FlashSale;
