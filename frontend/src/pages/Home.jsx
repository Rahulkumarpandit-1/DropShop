import React, { useEffect, useState, useRef, Suspense } from "react";
import { getProducts, addToCart, getTrendingProducts, getWishlist, toggleWishlist } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Lazy Load New Components
const CategoryGrid = React.lazy(() => import('../Components/Home/CategoryGrid'));
const FlashSale = React.lazy(() => import('../Components/Home/FlashSale'));
const ProductCarousel = React.lazy(() => import('../Components/Home/ProductCarousel'));
const CustomerReviews = React.lazy(() => import('../Components/Home/CustomerReviews'));
const InstagramGallery = React.lazy(() => import('../Components/Home/InstagramGallery'));
const WhyChooseUs = React.lazy(() => import('../Components/Home/WhyChooseUs'));
import ProductCard from "../Components/ProductCard";

function Home({ selectedCategory, setSelectedCategory }) {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [addedId, setAddedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState([]);

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
    
    // Load recently viewed
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(viewed);
    } catch(e) { console.error(e); }
  }, [page, selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    if (!images.length) return;
    const timer = setInterval(() => setCurrentIndex(p => (p + 1) % images.length), 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(page, selectedCategory, searchQuery, "All", sortBy);
      setProducts(Array.isArray(data) ? data : data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTrendingProducts();
    fetchWishlist();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const data = await getTrendingProducts(8);
      setTrendingProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      console.error("fetchTrendingProducts error:", err);
      setTrendingProducts([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await getWishlist();
      setWishlist((data.wishlist || []).map(w => w._id || w));
    } catch {
      console.error("fetchWishlist error");
    }
  };

  const handleAddToCart = async (e, id) => {
    e.stopPropagation();
    await addToCart(id);
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }
    try {
      const data = await toggleWishlist(productId);
      setWishlist((data.wishlist || []).map(w => w._id || w));
      if ((data.wishlist || []).some(w => (w._id || w) === productId)) {
        toast.success("Added to wishlist!");
      } else {
        toast.success("Removed from wishlist!");
      }
    } catch (err) {
      toast.error("Could not update wishlist");
    }
  };

  const filteredProducts = Array.isArray(products) ? products : [];
  
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const mockRecommended = [...filteredProducts].sort(() => 0.5 - Math.random()).slice(0, 8);
  const mockTopRated = [...filteredProducts].filter(p => (p.rating || 4.5) >= 4.5).slice(0, 8);
  const mockNewArrivals = [...filteredProducts].slice(0, 8);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>
      
      {/* ── HERO ── */}
      <div className="premium-hero">
        {images.length > 0 ? (
          <img src={images[currentIndex]} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)"
          }} />
        )}

        <div className="premium-hero-overlay">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="premium-hero-badge"
          >
            New Arrivals 2026
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="premium-hero-title" style={{ color: "#ffffff" }}
          >
            Shop Premium.<br />
            <span>Live Better.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            style={{ color: "#ffffff", opacity: 0.8, fontSize: "1rem", marginBottom: "2.5rem", maxWidth: "480px", lineHeight: 1.7 }}
          >
            Curated products for the modern lifestyle. Free delivery on every order.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="premium-btn-primary"
            >Shop Now</button>
            <button style={{ color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.4)" }}
              onClick={() => navigate("/cart")}
              className="premium-btn-secondary"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)"; e.currentTarget.style.background = "transparent"; }}
            >View Cart</button>
          </motion.div>
        </div>

        {/* Prev/Next */}
        {images.length > 1 && <>
          <button onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)} style={{ position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", zIndex: 10 }}>‹</button>
          <button onClick={() => setCurrentIndex((currentIndex + 1) % images.length)} style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", zIndex: 10 }}>›</button>
          <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.5rem", zIndex: 10 }}>
            {images.map((_, i) => (
              <div key={i} onClick={() => setCurrentIndex(i)} style={{ width: i === currentIndex ? "24px" : "8px", height: "8px", borderRadius: "980px", background: i === currentIndex ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s ease" }} />
            ))}
          </div>
        </>}
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
        
        {/* CategoryGrid */}
        <Suspense fallback={<div className="shimmer-bg" style={{ height: "400px", margin: "2rem 0", borderRadius: "16px" }} />}>
          <CategoryGrid onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
          }} />
        </Suspense>

        <Suspense fallback={null}>
          <ProductCarousel 
            title="Recommended For You" 
            subtitle="Based On Your Interests"
            products={mockRecommended} 
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            addedId={addedId}
            wishlist={wishlist}
          />
        </Suspense>


        {/* ── TRENDING ── */}
        <section className="home-section" style={{ margin: "4rem 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>Hot right now</p>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>Trending Products</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => scrollSlider("left")}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s"
                }}
              >‹</button>
              <button
                onClick={() => scrollSlider("right")}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s"
                }}
              >›</button>
              <span onClick={() => navigate("/products")} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer", marginLeft: "0.5rem" }}>View all →</span>
            </div>
          </div>

          <div ref={sliderRef} className="hide-scrollbar" style={{ display: "flex", gap: "1.5rem", overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: "2rem" }}>
            {trendingLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} style={{ flex: "0 0 280px" }}>
                  <div className="shimmer-bg" style={{ height: "350px", borderRadius: "24px" }} />
                </div>
              ))
            ) : trendingProducts.length === 0 ? (
              <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>No trending products yet</div>
            ) : (
              trendingProducts.map((p) => (
                <div key={p._id} style={{ flex: "0 0 280px", scrollSnapAlign: "start" }}>
                  <ProductCard product={p} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} addedId={addedId} wishlist={wishlist} />
                </div>
              ))
            )}
          </div>
        </section>

        <Suspense fallback={null}>
          <ProductCarousel 
            title="New Arrivals" 
            subtitle="Just Dropped"
            products={mockNewArrivals} 
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            addedId={addedId}
            wishlist={wishlist}
          />
        </Suspense>

        {/* ── ALL PRODUCTS ── */}
        <div id="products" className="home-section" style={{ margin: "5rem 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                {searchQuery ? "Search Results" : "Our Collection"}
              </p>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
                {searchQuery ? `"${searchQuery}"` : "All Products"}
              </h2>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "980px",
                padding: "0.6rem 1.2rem",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif"
              }}
            >
              <option value="">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2rem" }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="shimmer-bg" style={{ height: "400px", borderRadius: "24px" }} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "6rem 0" }}>
              <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No products found</h3>
              <p style={{ color: "var(--text-secondary)" }}>Try a different category or search term</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((p) => (
                <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} addedId={addedId} wishlist={wishlist} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "4rem" }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ background: page === 1 ? "rgba(0,0,0,0.02)" : "var(--card-bg)", color: page === 1 ? "var(--text-secondary)" : "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "980px", padding: "0.6rem 1.5rem", fontSize: "0.85rem", cursor: page === 1 ? "not-allowed" : "pointer" }}>← Prev</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: page === i + 1 ? "var(--text-primary)" : "var(--card-bg)", color: page === i + 1 ? "var(--bg-primary)" : "var(--text-secondary)", border: "1px solid", borderColor: page === i + 1 ? "var(--text-primary)" : "var(--border)", fontSize: "0.85rem", cursor: "pointer" }}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ background: page === totalPages ? "rgba(0,0,0,0.02)" : "var(--card-bg)", color: page === totalPages ? "var(--text-secondary)" : "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "980px", padding: "0.6rem 1.5rem", fontSize: "0.85rem", cursor: page === totalPages ? "not-allowed" : "pointer" }}>Next →</button>
            </div>
          )}
        </div>

        <Suspense fallback={null}>
          <ProductCarousel 
            title="Top Rated" 
            subtitle="Customer Favorites"
            products={mockTopRated} 
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            addedId={addedId}
            wishlist={wishlist}
          />
        </Suspense>

        {recentlyViewed.length > 0 && (
          <Suspense fallback={null}>
            <ProductCarousel 
              title="Recently Viewed" 
              subtitle="Pick Up Where You Left Off"
              products={recentlyViewed} 
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              addedId={addedId}
              wishlist={wishlist}
            />
          </Suspense>
        )}

        <Suspense fallback={null}>
          <WhyChooseUs />
        </Suspense>

        <Suspense fallback={null}>
          <CustomerReviews />
        </Suspense>

        {/* ── TRUST STRIP ── */}
        <div className="premium-trust-strip" style={{ marginTop: "4rem", marginBottom: "2rem" }}>
          <div className="premium-trust-grid" style={{ background: "var(--card-bg)", borderRadius: "16px", padding: "2rem", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid var(--border)" }}>
            {[
              { icon: "🚚", label: "Free Delivery", sub: "On all orders" },
              { icon: "💳", label: "Secure Payment", sub: "100% protected" },
              { icon: "↩️", label: "Easy Returns", sub: "7-day policy" },
              { icon: "🎧", label: "24/7 Support", sub: "Always here" },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="premium-trust-item" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="premium-trust-icon-box" style={{ fontSize: "1.5rem", background: "var(--bg-primary)", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid var(--border)" }}>{icon}</span>
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 0.15rem" }}>{label}</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Suspense fallback={null}>
          <InstagramGallery />
        </Suspense>

        {/* ── NEWSLETTER SECTION ── */}
        <section className="newsletter-section" style={{ margin: "5rem 0" }}>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5 }}
            className="newsletter-card" style={{ background: "linear-gradient(135deg, var(--card-bg) 0%, var(--bg-primary) 100%)", border: "1px solid var(--border)", borderRadius: "32px", padding: "4rem 2rem", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
          >
            <h2 className="newsletter-title" style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 1rem", fontFamily: "Cormorant Garamond, serif" }}>Subscribe to the Club</h2>
            <p className="newsletter-desc" style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "500px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
              Join our exclusive inner circle to get early access to new arrivals, curated drops, and luxury member-only offers.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }} style={{ display: "flex", gap: "1rem", maxWidth: "450px", margin: "0 auto" }}>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                style={{
                  flex: 1,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "980px",
                  padding: "1rem 1.5rem",
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
                }}
              />
              <button type="submit" className="premium-btn-primary" style={{ padding: "1rem 2rem", borderRadius: "980px", background: "var(--text-primary)", color: "var(--bg-primary)", fontWeight: 600, border: "none", cursor: "pointer" }}>Subscribe</button>
            </form>
          </motion.div>
        </section>

      </div>
      
      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--bg-secondary)", padding: "4rem 2rem 2rem", marginTop: "4rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem", marginBottom: "3rem" }}>
            <div>
              <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", fontFamily: "Cormorant Garamond, serif" }}>
                DropShop<span style={{ color: "var(--accent)" }}>.</span>
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "260px" }}>
                Premium products for the modern lifestyle. Quality guaranteed.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                {["𝕏", "in", "f", "ig"].map(s => (
                  <div key={s} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
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
                <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-primary)", marginBottom: "1.2rem", fontWeight: 600 }}>{title}</p>
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
                    style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.8rem", cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
                  >{link}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ height: "1px", background: "var(--border)", marginBottom: "2rem" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>© 2026 DropShop. All rights reserved.</p>
            <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.85rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
              <span>💳 Visa / Mastercard / UPI / COD</span>
              <span>•</span>
              <span>🇮🇳 India (INR)</span>
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Privacy Policy", "Terms", "Cookies"].map(link => (
                <p key={link} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
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