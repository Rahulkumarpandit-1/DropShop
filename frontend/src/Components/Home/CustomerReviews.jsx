import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Aarav Sharma",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    rating: 5,
    text: "The quality is simply unmatched. I've bought several items from the luxury collection and they always exceed my expectations.",
    date: "2 days ago"
  },
  {
    id: 2,
    name: "Priya Patel",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    rating: 5,
    text: "Fast shipping and impeccable packaging. The customer service team is very responsive and helpful. Highly recommended!",
    date: "1 week ago"
  },
  {
    id: 3,
    name: "Vikram Singh",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    rating: 4,
    text: "Beautiful design and great functionality. It perfectly complements my home decor. Will definitely be ordering more.",
    date: "2 weeks ago"
  }
];

const CustomerReviews = () => {
  return (
    <section className="home-section" style={{ margin: "5rem 0" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem" }}>
          Testimonials
        </p>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
          What Our Clients Say
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {reviews.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "2rem",
              position: "relative"
            }}
          >
            <div style={{ position: "absolute", top: "1.5rem", right: "2rem", opacity: 0.1 }}>
              <Quote size={48} color="var(--text-primary)" />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "1rem" }}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < review.rating ? "var(--accent)" : "none"} 
                  color={i < review.rating ? "var(--accent)" : "var(--border)"} 
                />
              ))}
            </div>
            
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.5rem", fontStyle: "italic" }}>
              "{review.text}"
            </p>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img 
                src={review.avatar} 
                alt={review.name} 
                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} 
              />
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 0.2rem" }}>
                  {review.name}
                </h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                  {review.date}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CustomerReviews;
