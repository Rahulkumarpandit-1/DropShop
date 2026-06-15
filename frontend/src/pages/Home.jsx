import { useEffect, useState, useRef } from "react";
import { getProducts, addToCart, getTrendingProducts } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function Home({ selectedCategory, setSelectedCategory }) {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [addedId, setAddedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("search") || "";

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

  const images = ["/banner_electronics.png", "/banner_fashion.png", "/banner_accessories.png"];

  useEffect(() => {
    document.title = "DropShop | Premium Curated Collection";
    fetchProducts();
  }, [page, selectedCategory]);

  useEffect(() => {
    if (!images.length) return;
    const timer = setInterval(() => setCurrentIndex(p => (p + 1) % images.length), 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts(page, selectedCategory);
      setProducts(Array.isArray(data) ? data : data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const data = await getTrendingProducts(8);
      setTrendingProducts(data);
    } catch (err) {
      console.error("fetchTrendingProducts error:", err);
    } finally {
      setTrendingLoading(false);
    }
  };

  const handleAddToCart = async (e, id) => {
    e.stopPropagation();
    await addToCart(id);
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filteredProducts = Array.isArray(products)
    ? products
      .filter(p => selectedCategory === "All" || p.category?.toLowerCase() === selectedCategory?.toLowerCase())
      .filter(p => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  // Home.jsx — add this useEffect
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]); // 👈 reset whenever category OR search changes
  const categories = [
    { name: "All", icon: "🛍️" },
    { name: "Electronic", icon: "⚡" },
    { name: "Fashion", icon: "👗" },
    { name: "Accessories", icon: "💎" },
    { name: "Home", icon: "🏠" },
  ];

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", color: "var(--white)" }}>

      {/* ── HERO ── */}
      <div className="premium-hero">
        {images.length > 0 ? (
          <img src={images[currentIndex]} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)"
          }} />
        )}

        <div className="premium-hero-overlay">
          <span className="premium-hero-badge">
            New Arrivals 2026
          </span>
          <h1 className="premium-hero-title" style={{ color: "white" }}>
            Shop Premium.<br />
            <span>Live Better.</span>
          </h1>
          <p style={{ color: "var(--grey)", fontSize: "1rem", marginBottom: "2.5rem", maxWidth: "480px", lineHeight: 1.7 }}>
            Curated products for the modern lifestyle. Free delivery on every order.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="premium-btn-primary"
            >Shop Now</button>
            <button style={{ color: "white" }}
              onClick={() => navigate("/cart")}
              className="premium-btn-secondary"
            >View Cart</button>
          </div>
        </div>

        {/* Prev/Next */}
        {images.length > 1 && <>
          <button onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)} style={{ position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>‹</button>
          <button onClick={() => setCurrentIndex((currentIndex + 1) % images.length)} style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>›</button>
          <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.5rem" }}>
            {images.map((_, i) => (
              <div key={i} onClick={() => setCurrentIndex(i)} style={{ width: i === currentIndex ? "24px" : "8px", height: "8px", borderRadius: "980px", background: i === currentIndex ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s ease" }} />
            ))}
          </div>
        </>}
      </div>

      {/* ── TRUST STRIP ── */}
      <div className="premium-trust-strip">
        <div className="premium-trust-grid">
          {[
            { icon: "🚚", label: "Free Delivery", sub: "On all orders" },
            { icon: "💳", label: "Secure Payment", sub: "100% protected" },
            { icon: "↩️", label: "Easy Returns", sub: "7 day policy" },
            { icon: "🎧", label: "24/7 Support", sub: "Always here" },
          ].map(({ icon, label, sub }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "flex-start", padding: "0.5rem 1rem", background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "1.5rem" }}>{icon}</span>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--white)", margin: 0 }}>{label}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--grey)", margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="home-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--white)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>Shop by Category</h2>
        </div>
        <div className="category-scroll-container">
          {categories.map(({ name, icon }) => (
            <div
              key={name}
              onClick={() => {
                navigate(`/products?category=${name}`)
              }}
              className={`category-pill ${selectedCategory === name ? "category-pill--active" : ""}`}
            >
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* ── TRENDING ── */}
      <div className="home-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--grey)", marginBottom: "0.3rem" }}>Hot right now</p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--white)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>Trending Products</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => scrollSlider("left")}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                color: "var(--white)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              ‹
            </button>
            <button
              onClick={() => scrollSlider("right")}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                color: "var(--white)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              ›
            </button>
            <span
              onClick={() => navigate("/products")}
              style={{ fontSize: "0.82rem", color: "var(--grey)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", marginLeft: "0.5rem" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--grey)"}
            >View all →</span>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="trending-slider"
        >
          {trendingLoading ? (
            /* Loading skeletons for trending products */
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="premium-card"
                style={{ flex: "0 0 280px" }}
              >
                <div style={{ height: "180px", background: "linear-gradient(90deg, var(--black) 25%, var(--border) 50%, var(--black) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                <div style={{ padding: "1rem" }}>
                  <div style={{ height: "14px", background: "var(--border)", borderRadius: "6px", marginBottom: "8px", width: "70%" }} />
                  <div style={{ height: "12px", background: "var(--border)", borderRadius: "6px", width: "50%" }} />
                </div>
              </div>
            ))
          ) : trendingProducts.length === 0 ? (
            <div style={{ padding: "2rem", color: "var(--grey)", fontSize: "0.88rem" }}>No trending products yet</div>
          ) : (
            trendingProducts.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/product/${p._id}`)}
                className="premium-card"
                style={{ cursor: "pointer" }}
              >
                <div style={{ position: "relative", height: "180px", background: "rgba(255,255,255,0.01)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1rem" }} />
                  <span style={{ position: "absolute", top: "10px", left: "10px", background: "var(--error)", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "980px" }}>🔥 HOT</span>
                </div>
                <div style={{ padding: "1rem" }}>
                  <h3 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--white)", margin: "0 0 0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>₹{p.price?.toLocaleString()}</p>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--grey)", textDecoration: "line-through" }}>₹{p.originalPrice.toLocaleString()}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: 600 }}>{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF</span>
                        </div>
                      )}
                    </div>
                    <button onClick={(e) => handleAddToCart(e, p._id)} style={{ background: addedId === p._id ? "var(--success)" : "rgba(0, 0, 0, 0.05)", color: addedId === p._id ? "#fff" : "var(--white)", border: "none", borderRadius: "980px", padding: "0.4rem 1rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                      {addedId === p._id ? "✓" : "+ Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── PROMO BANNER ── */}
      <div style={{ maxWidth: "1200px", margin: "3rem auto 0", padding: "0 1rem" }}>
        <div className="promo-banner">
          <div>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem" }}>Limited Offer</p>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--white)", margin: "0 0 0.5rem", lineHeight: 1.2, fontFamily: "Cormorant Garamond, serif" }}>
              Free Delivery on<br />All Orders 🚚
            </h2>
            <p style={{ color: "var(--grey)", fontSize: "0.88rem", margin: 0 }}>No minimum. No conditions. Just shop!</p>
          </div>
          <button
            onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
            className="premium-btn-primary"
          >Shop Now →</button>
        </div>
      </div>

      {/* ── ALL PRODUCTS ── */}
      <div id="products" className="home-section home-section--bottom">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--grey)", marginBottom: "0.3rem" }}>
              {searchQuery ? "Search Results" : "Our Collection"}
            </p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--white)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
              {searchQuery ? `"${searchQuery}"` : "All Products"}
            </h2>
          </div>
          <span style={{ fontSize: "0.82rem", color: "var(--grey)", background: "var(--card-bg)", border: "1px solid var(--border)", padding: "0.3rem 0.75rem", borderRadius: "980px" }}>
            {filteredProducts.length} items
          </span>
        </div>

        {loading ? (
          <div className="premium-product-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="premium-card">
                <div style={{ height: "220px", background: "linear-gradient(90deg, var(--black) 25%, var(--border) 50%, var(--black) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                <div style={{ padding: "1.25rem" }}>
                  <div style={{ height: "14px", background: "var(--border)", borderRadius: "6px", marginBottom: "8px", width: "70%" }} />
                  <div style={{ height: "12px", background: "var(--border)", borderRadius: "6px", width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--white)", marginBottom: "0.5rem" }}>No products found</h3>
            <p style={{ color: "var(--grey)" }}>Try a different category or search term</p>
          </div>
        ) : (
          <div className="premium-product-grid">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/product/${p._id}`)}
                className="premium-card"
                style={{ cursor: "pointer" }}
              >
                <div style={{ position: "relative", height: "220px", background: "rgba(255,255,255,0.01)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1.25rem" }} />
                  {p.stock !== undefined && p.stock <= 5 && p.stock > 0 && (
                    <span style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(226,184,127,0.1)", color: "var(--accent)", fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "980px", border: "1px solid rgba(226,184,127,0.2)" }}>
                      Only {p.stock} left!
                    </span>
                  )}
                  {p.stock === 0 && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "var(--white)", fontSize: "0.85rem", fontWeight: 600, background: "rgba(0,0,0,0.05)", padding: "0.4rem 1rem", borderRadius: "980px" }}>Out of Stock</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--white)", marginBottom: "0.3rem", lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--grey)", marginBottom: "1rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.4rem" }}>
                    {p.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
                        ₹{p.price?.toLocaleString()}
                      </p>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--grey)", textDecoration: "line-through" }}>₹{p.originalPrice.toLocaleString()}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--success)", fontWeight: 600 }}>{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, p._id)}
                      disabled={p.stock === 0}
                      style={{
                        background: addedId === p._id ? "var(--success)" : "rgba(0, 0, 0, 0.05)",
                        color: addedId === p._id ? "#fff" : "var(--white)", border: "none",
                        borderRadius: "980px", padding: "0.5rem 1.1rem",
                        fontSize: "0.78rem", fontWeight: 600,
                        cursor: p.stock === 0 ? "not-allowed" : "pointer",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.2s ease",
                        opacity: p.stock === 0 ? 0.4 : 1
                      }}
                    >
                      {addedId === p._id ? "✓ Added" : "+ Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "3rem" }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ background: page === 1 ? "rgba(0,0,0,0.02)" : "var(--card-bg)", color: page === 1 ? "var(--grey)" : "var(--white)", border: "1px solid var(--border)", borderRadius: "980px", padding: "0.5rem 1.25rem", fontSize: "0.82rem", cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}>← Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: page === i + 1 ? "var(--white)" : "var(--card-bg)", color: page === i + 1 ? "var(--black)" : "var(--grey)", border: "1px solid", borderColor: page === i + 1 ? "var(--white)" : "var(--border)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s" }}>{i + 1}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ background: page === totalPages ? "rgba(0,0,0,0.02)" : "var(--card-bg)", color: page === totalPages ? "var(--grey)" : "var(--white)", border: "1px solid var(--border)", borderRadius: "980px", padding: "0.5rem 1.25rem", fontSize: "0.82rem", cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}>Next →</button>
          </div>
        )}
      </div>

      {/* ── LOOKBOOK SECTION ── */}
      <section className="lookbook-section">
        <div className="lookbook-content">
          <span style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem", display: "block" }}>Crafted Elegance</span>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--white)", margin: "0 0 1.25rem", fontFamily: "Cormorant Garamond, serif" }}>The Art of Premium Living</h2>
          <p style={{ color: "var(--grey)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Every product in our collection is handpicked by our expert design team, ensuring that your home and lifestyle reflect visual excellence and durability. Experience premium aesthetics.
          </p>
          <button onClick={() => navigate("/products")} className="premium-btn-primary">Explore Collection</button>
        </div>
        <div className="lookbook-image">
          <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80" alt="Lookbook" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="testimonials-section">
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--grey)", marginBottom: "0.3rem" }}>What they say</p>
          <h2 style={{ fontSize: "2rem", fontWeight: 600, color: "var(--white)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>Customer Reviews</h2>
        </div>
        <div className="testimonials-grid">
          {[
            { name: "Aarav Mehta", comment: "The build quality of the electronic items is premium. Ordering was seamless, and delivery took only two days. Customer support answered my query in minutes.", stars: 5, initial: "A", role: "Verified Buyer" },
            { name: "Priya Sharma", comment: "Absolutely love the minimalist fashion collection! The fabrics feel luxurious and durable. Highly recommend this site for high-end curated finds.", stars: 5, initial: "P", role: "Loyal Customer" },
            { name: "Rohan Das", comment: "DropShop has completely elevated my work-from-home desk setup with their accessories. The packaging was top-tier, and shipping was free as promised.", stars: 5, initial: "R", role: "Verified Buyer" }
          ].map((t) => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
              <p className="testimonial-comment">"{t.comment}"</p>
              <div className="testimonial-user">
                <div className="testimonial-avatar">{t.initial}</div>
                <div className="testimonial-info">
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="faq-section">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { q: "What is DropShop's shipping policy?", a: "We offer 100% free delivery on all orders across India, with no minimum purchase requirement. Orders are processed within 24 hours and delivered within 3-5 business days." },
            { q: "How do I return a product?", a: "We have an easy 7-day hassle-free return policy. If you're not completely satisfied with your order, simply request a return from your profile or contact our support team." },
            { q: "Are payments secure on your platform?", a: "Absolutely. We use industry-leading encryption and partner with Razorpay to support cards, UPI, net banking, and secure Cash on Delivery (COD)." },
            { q: "How can I track my order status?", a: "Once your order is placed, you can track its progress in real-time by visiting the 'Order History' page in your profile drawer, or by clicking the tracking link sent via email." }
          ].map((faq, idx) => (
            <div
              key={idx}
              className="faq-item"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className={`faq-icon ${activeFaq === idx ? "open" : ""}`}>+</span>
              </div>
              <div className={`faq-answer ${activeFaq === idx ? "open" : ""}`}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER SECTION ── */}
      <section className="newsletter-section">
        <div className="newsletter-card">
          <h2 className="newsletter-title">Subscribe to the Club</h2>
          <p className="newsletter-desc">
            Join our exclusive inner circle to get early access to new arrivals, curated drops, and luxury member-only offers.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }} className="newsletter-form">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border)",
                borderRadius: "980px",
                padding: "0.9rem 1.5rem",
                fontSize: "0.88rem",
                color: "var(--white)",
                outline: "none",
                fontFamily: "'Inter', sans-serif"
              }}
            />
            <button type="submit" className="premium-btn-primary" style={{ flexShrink: 0 }}>Subscribe</button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111", padding: "3rem 2rem 2rem", marginTop: "4rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="footer-grid">
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem", fontFamily: "Inter, sans-serif" }}>
                DropShop<span style={{ color: "#e8d5b7" }}>.</span>
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.7, maxWidth: "260px" }}>
                Premium products for the modern lifestyle. Quality guaranteed.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                {["𝕏", "in", "f", "ig"].map(s => (
                  <div key={s} style={{ width: "34px", height: "34px", borderRadius: "50%", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#666"; }}
                  >{s}</div>
                ))}
              </div>
            </div>
            {[
              { title: "Shop", links: ["All Products", "New Arrivals", "Best Sellers", "Offers"] },
              { title: "Account", links: ["My Orders", "My Cart", "Profile", "Sign In"] },
              { title: "Help", links: ["Help Center", "Track Order", "Returns", "Contact Us"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", marginBottom: "1rem", fontWeight: 600 }}>{title}</p>
                {links.map(link => (
                  <p key={link}
                    onClick={() => {
                      const routes = {
                        "All Products": "/products",
                        "New Arrivals": "/products",
                        "Best Sellers": "/products",
                        "Offers": "/products",
                        "My Orders": "/orders",
                        "My Cart": "/cart",
                        "Profile": "/profile",
                        "Sign In": "/",
                        "Help Center": "/",
                        "Track Order": "/orders",
                        "Returns": "/orders",
                        "Contact Us": "/",
                      };
                      navigate(routes[link] || "/");
                    }}
                    style={{ fontSize: "0.82rem", color: "#666", marginBottom: "0.6rem", cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.color = "#666"}
                  >{link}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ height: "1px", background: "#222", marginBottom: "1.5rem" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ fontSize: "0.78rem", color: "#555" }}>© 2026 DropShop. All rights reserved.</p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Privacy Policy", "Terms", "Cookies"].map(link => (
                <p key={link} style={{ fontSize: "0.78rem", color: "#555", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "#555"}
                >{link}</p>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;