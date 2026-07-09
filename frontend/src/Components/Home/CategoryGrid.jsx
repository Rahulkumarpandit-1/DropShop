import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80" },
  { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=500&q=80" },
  { name: "Home & Kitchen", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80" },
  { name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80" },
  { name: "Kids & Toys", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80" },
  { name: "Furniture", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80" },
  { name: "Gaming", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=500&q=80" },
  { name: "Sports", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=500&q=80" },
  { name: "Watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80" },
  { name: "Mobile Accessories", image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=500&q=80" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const CategoryGrid = ({ onSelectCategory }) => {
  return (
    <section className="home-section" style={{ margin: "4rem 0" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
          Shop by Category
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Discover our curated collections
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="category-grid"
        style={{ 
          display: "grid"
        }}
      >
        {categories.map((cat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onClick={() => onSelectCategory(cat.name)}
            className="category-card group"
            style={{
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              cursor: "pointer"
            }}
          >
            <motion.img 
              src={cat.image} 
              alt={cat.name}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="category-card-overlay" style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
              display: "flex",
              alignItems: "flex-end"
            }}>
              <h3 className="category-card-title" style={{ 
                color: "#fff", 
                fontWeight: 600, 
                margin: 0,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                {cat.name}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default CategoryGrid;
