import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RefreshCw, HeadphonesIcon, Award } from 'lucide-react';

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders above ₹999", delay: 0.1 },
  { icon: ShieldCheck, title: "Secure Payments", desc: "100% protected transactions", delay: 0.2 },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day hassle-free return policy", delay: 0.3 },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Dedicated customer service", delay: 0.4 },
  { icon: Award, title: "Genuine Products", desc: "Sourced directly from brands", delay: 0.5 }
];

const WhyChooseUs = () => {
  return (
    <section className="home-section" style={{ margin: "5rem 0", padding: "4rem 2rem", background: "var(--card-bg)", borderRadius: "32px", border: "1px solid var(--border)" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem" }}>
          The DropShop Promise
        </p>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
          Why Choose Us
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem" }}>
        {features.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: item.delay }}
            whileHover={{ y: -8 }}
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              textAlign: "center",
              cursor: "default"
            }}
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
                color: "var(--accent)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
              }}
            >
              <item.icon size={32} strokeWidth={1.5} />
            </motion.div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              {item.title}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "200px" }}>
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
