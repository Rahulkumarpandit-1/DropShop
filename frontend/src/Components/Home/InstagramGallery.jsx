import React from 'react';
import { Camera } from 'lucide-react';

const images = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=400&q=80"
];

const InstagramGallery = () => {
  return (
    <section style={{ margin: "5rem 0" }}>
      <div style={{ textAlign: "center", margin: "0 auto 3rem", padding: "0 1rem" }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <Camera size={14} /> Follow Us
        </p>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "\"Outfit\", sans-serif" }}>
          Shop The Look
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          @dropshop_official
        </p>
      </div>

      <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
        {images.map((img, idx) => (
          <div 
            key={idx}
            style={{ 
              flex: "1 1 20%",
              aspectRatio: "1/1",
              position: "relative",
              cursor: "pointer",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
              e.currentTarget.querySelector('.overlay').style.opacity = '1';
            }}
            onMouseLeave={e => {
              e.currentTarget.querySelector('img').style.transform = 'scale(1)';
              e.currentTarget.querySelector('.overlay').style.opacity = '0';
            }}
          >
            <img 
              src={img} 
              alt={`Instagram post ${idx}`} 
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} 
            />
            <div 
              className="overlay"
              style={{ 
                position: "absolute", 
                inset: 0, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
                opacity: 0,
                transition: "opacity 0.3s ease",
              }}
            >
              <Camera size={32} color="#fff" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InstagramGallery;
