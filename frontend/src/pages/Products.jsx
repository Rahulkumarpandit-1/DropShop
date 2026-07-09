import { useEffect, useState, useMemo } from "react";
import { getProducts, addToCart, getWishlist, toggleWishlist as apiToggleWishlist } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function Products() {
  const [products, setProducts] = useState([]);
  const [addedId, setAddedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [wishlist, setWishlist] = useState([]);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // ── Parse URL params (single instance) ──
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const searchQuery = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || "All";
  const subcategoryFromUrl = searchParams.get("subcategory") || "All";

  const categoryMap = {
    All: [],
    Electronic: ["Phones", "Laptops", "Audio", "Tools", "Accessories"],
    Fashion: ["Shirts", "Jeans", "Shoes", "Dresses", "Ethnic"],
    Accessories: ["Watches", "Bags", "Jewellery", "Sunglasses"],
    Home: ["Furniture", "Kitchen", "Decor", "Lighting"],
    Kids: ["Toys", "Clothing", "Baby Care"],
  };

  const priceRanges = [
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500 – ₹1,000", min: 500, max: 1000 },
    { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
    { label: "Above ₹5,000", min: 5000, max: Infinity },
  ];

  const categories = ["All", "Electronic", "Fashion", "Accessories", "Home", "Kids"];

  // ── Sync category & subcategory from URL ──
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setSelectedSubcategory(subcategoryFromUrl);
  }, [categoryFromUrl, subcategoryFromUrl]);

  // ── URL Navigation Handlers ──
  const handleCategorySelect = (cat) => {
    const params = new URLSearchParams(location.search);
    if (cat && cat !== "All") {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    params.delete("subcategory");
    navigate(`/products?${params.toString()}`);
  };

  const handleSubcategorySelect = (sub) => {
    const params = new URLSearchParams(location.search);
    if (sub && sub !== "All") {
      params.set("subcategory", sub);
    } else {
      params.delete("subcategory");
    }
    navigate(`/products?${params.toString()}`);
  };

  useEffect(() => {
    const titleCategory = selectedCategory && selectedCategory !== "All" ? selectedCategory : "Discover";
    const titleSearch = searchQuery ? `Search: "${searchQuery}"` : "";
    document.title = titleSearch ? `DropShop | ${titleSearch}` : `DropShop | ${titleCategory} Collection`;
  }, [selectedCategory, searchQuery]);

  // ── Sync catalog search input ──
  useEffect(() => {
    setCatalogSearch(searchQuery);
  }, [searchQuery]);

  // ── Fetch products & wishlist ──
  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, selectedSubcategory]);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist((data.wishlist || []).map(w => w._id || w));
    } catch (err) {
      console.error("fetchWishlist error:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(1, selectedCategory, searchQuery, selectedSubcategory);
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch {
      setProducts([]);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ── Add to cart ──
  const handleAddToCart = async (e, id) => {
    e.stopPropagation();
    try {
      await addToCart(id);
      setAddedId(id);
      toast.success("Added to cart!");
      setTimeout(() => setAddedId(null), 1500);
    } catch {
      toast.error("Could not add to cart");
    }
  };

  // ── Wishlist toggle ──
  const handleToggleWishlist = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }
    try {
      const res = await apiToggleWishlist(id);
      if (res.added) {
        setWishlist((prev) => [...prev, id]);
        toast.success("Added to wishlist!");
      } else {
        setWishlist((prev) => prev.filter((w) => w !== id));
        toast.success("Removed from wishlist!");
      }
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  // ── Filtered + Sorted products ──
  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (p) =>
          selectedSubcategory === "All" ||
          p.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase()
      )
      .filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "newest")
          return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
  }, [products, selectedSubcategory, priceRange, sortBy]);

  // ── Reset all filters ──
  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setPriceRange({ min: 0, max: Infinity });
    setSortBy("relevance");
    navigate("/products");
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedSubcategory !== "All" ||
    priceRange.min !== 0 ||
    priceRange.max !== Infinity;

  // ─────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────
  const styles = {
    page: {
      background: "var(--black)",
      minHeight: "100vh",
      padding: "100px 2rem 4rem",
      fontFamily: "'Inter', sans-serif",
    },
    inner: { maxWidth: "1200px", margin: "0 auto" },

    // Breadcrumb
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.8rem",
    },
    breadcrumbLink: {
      color: "var(--grey)",
      cursor: "pointer",
      transition: "color 0.15s",
    },
    breadcrumbCurrent: { color: "var(--white)", fontWeight: 500 },

    // Product card
    card: {
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      overflow: "hidden",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
      position: "relative",
    },
    imgWrap: {
      position: "relative",
      height: "200px",
      background: "rgba(255, 255, 255, 0.01)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    img: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      padding: "1rem",
    },
    wishBtn: (active) => ({
      position: "absolute",
      top: "15px",
      right: "10px",
      background: active ? "rgba(255, 69, 58, 0.12)" : "rgba(255, 255, 255, 0.8)",
      border: active ? "1px solid rgba(255, 69, 58, 0.25)" : "1px solid var(--border)",
      borderRadius: "50%",
      width: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "0.9rem",
      transition: "all 0.2s",
      backdropFilter: "blur(4px)",
    }),
    lowStockBadge: {
      position: "absolute",
      top: "8px",
      right: "8px",
      background: "rgba(226, 184, 127, 0.1)",
      color: "var(--accent)",
      border: "1px solid rgba(226, 184, 127, 0.2)",
      fontSize: "0.65rem",
      fontWeight: 600,
      padding: "0.2rem 0.5rem",
      borderRadius: "980px",
    },
    outOfStockOverlay: {
      position: "absolute",
      inset: 0,
      background: "rgba(255, 255, 255, 0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(2px)",
    },
    outOfStockLabel: {
      color: "var(--white)",
      fontWeight: 600,
      fontSize: "0.82rem",
      background: "rgba(255, 255, 255, 0.9)",
      border: "1px solid var(--border)",
      padding: "0.4rem 1rem",
      borderRadius: "980px",
    },
    cardBody: { padding: "1rem" },
    cardName: {
      fontSize: "0.88rem",
      fontWeight: 600,
      color: "var(--white)",
      marginBottom: "0.25rem",
      lineHeight: 1.4,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    cardDesc: {
      fontSize: "0.75rem",
      color: "var(--grey)",
      marginBottom: "0.85rem",
      lineHeight: 1.5,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      minHeight: "2.2rem",
    },
    cardBottom: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    price: { fontSize: "1.05rem", fontWeight: 700, color: "var(--accent)", margin: 0 },
    cartBtn: (added, outOfStock) => ({
      background: added ? "var(--success)" : "rgba(0, 0, 0, 0.05)",
      color: added ? "#fff" : "var(--white)",
      border: "none",
      borderRadius: "980px",
      padding: "0.4rem 0.9rem",
      fontSize: "0.75rem",
      fontWeight: 600,
      cursor: outOfStock ? "not-allowed" : "pointer",
      fontFamily: "'Inter', sans-serif",
      transition: "all 0.2s ease",
      opacity: outOfStock ? 0.4 : 1,
    }),

    // Empty state
    emptyWrap: { textAlign: "center", padding: "6rem 0" },
    emptyBtn: {
      background: "var(--accent)",
      color: "var(--black)",
      border: "none",
      borderRadius: "980px",
      padding: "0.75rem 2rem",
      fontSize: "0.85rem",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      transition: "transform 0.15s, opacity 0.15s",
    },
  };

  // ── RENDER ──
  return (
    <div style={styles.page}>
      <div style={styles.inner}>

        {/* ── TOP UTILITY TOOLBAR ── */}
        <div className="catalog-toolbar">
          <div className="catalog-toolbar__left">
            {/* Breadcrumbs */}
            <div style={styles.breadcrumb}>
              <span
                style={styles.breadcrumbLink}
                onClick={() => navigate("/")}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--grey)")}
              >
                Home
              </span>
              <span style={{ color: "var(--grey)", opacity: 0.5 }}>/</span>
              <span
                style={selectedCategory !== "All" ? styles.breadcrumbLink : styles.breadcrumbCurrent}
                onClick={() => {
                  if (selectedCategory !== "All") {
                    handleCategorySelect(selectedCategory);
                  }
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== "All") e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== "All") e.currentTarget.style.color = "var(--grey)";
                }}
              >
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </span>
              {selectedCategory !== "All" && selectedSubcategory !== "All" && (
                <>
                  <span style={{ color: "var(--grey)", opacity: 0.5 }}>/</span>
                  <span style={styles.breadcrumbCurrent}>{selectedSubcategory}</span>
                </>
              )}
            </div>

            <h1 className="catalog-title">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory === "All"
                  ? "All Products"
                  : selectedCategory}
            </h1>
          </div>

          <div className="catalog-toolbar__right">
            {/* Catalog search bar */}
            <div className="catalog-search-wrapper">
              <span className="catalog-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search collection..."
                value={catalogSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setCatalogSearch(val);
                  const params = new URLSearchParams(location.search);
                  if (val) {
                    params.set("search", val);
                  } else {
                    params.delete("search");
                  }
                  navigate(`/products?${params.toString()}`, { replace: true });
                }}
                className="catalog-search-input"
              />
            </div>

            <button
              className={`premium-filter-btn ${hasActiveFilters ? "active" : ""}`}
              onClick={() => setShowFiltersDrawer(true)}
            >
              <svg className="filter-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="filter-badge-dot">
                  {(selectedCategory !== "All" ? 1 : 0) +
                    (selectedSubcategory !== "All" ? 1 : 0) +
                    (priceRange.min !== 0 || priceRange.max !== Infinity ? 1 : 0)}
                </span>
              )}
            </button>

            <div className="select-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="premium-sort-select"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── SUBCATEGORY QUICK-LINKS ROW ── */}
        {selectedCategory !== "All" && categoryMap[selectedCategory]?.length > 0 && (
          <div style={{
            display: "flex",
            gap: "0.75rem",
            overflowX: "auto",
            padding: "0.25rem 0 1.25rem",
            marginBottom: "1rem",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }} className="subcategory-scroll-container">
            {["All", ...categoryMap[selectedCategory]].map((sub) => {
              const active = selectedSubcategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => handleSubcategorySelect(sub)}
                  style={{
                    background: active ? "var(--accent)" : "var(--card-bg)",
                    color: active ? "var(--black)" : "var(--white)",
                    border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                    borderRadius: "980px",
                    padding: "0.5rem 1.25rem",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.25s ease",
                    boxShadow: active ? "0 4px 15px rgba(226, 184, 127, 0.2)" : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "var(--card-bg)";
                    }
                  }}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* ── LAYOUT WRAPPER (PC Sidebar / Mobile Drawer) ── */}
        <div className="catalog-layout-wrapper">

          {/* ── FILTER DRAWER ── */}
          <div
            className={`filter-drawer-overlay ${showFiltersDrawer ? "active" : ""}`}
            onClick={() => setShowFiltersDrawer(false)}
          />

          <div className={`filter-drawer ${showFiltersDrawer ? "open" : ""}`}>
            <div className="filter-drawer-header">
              <h3>Filters</h3>
              <button className="filter-drawer-close-btn" onClick={() => setShowFiltersDrawer(false)}>✕</button>
            </div>

            <div className="filter-drawer-body">
              {/* Category Section */}
              <div className="filter-drawer-section">
                <h4 className="filter-section-title">Category</h4>
                <div className="filter-options-list">
                  {categories.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <div
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`filter-option-row ${active ? "active" : ""}`}
                      >
                        <span>{cat}</span>
                        <span className="filter-option-count">
                          {
                            products.filter(
                              (p) =>
                                cat === "All" ||
                                p.category?.toLowerCase() === cat.toLowerCase()
                            ).length
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subcategory Section */}
              {selectedCategory !== "All" &&
                categoryMap[selectedCategory]?.length > 0 && (
                  <div className="filter-drawer-section">
                    <h4 className="filter-section-title">Subcategory</h4>
                    <div className="filter-options-list">
                      {["All", ...categoryMap[selectedCategory]].map((sub) => {
                        const active = selectedSubcategory === sub;
                        return (
                          <div
                            key={sub}
                            onClick={() => handleSubcategorySelect(sub)}
                            className={`filter-option-row ${active ? "active" : ""}`}
                          >
                            <span>{sub}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Price Range Section */}
              <div className="filter-drawer-section">
                <h4 className="filter-section-title">Price Range</h4>
                <div className="filter-options-list">
                  {priceRanges.map(({ label, min, max }) => {
                    const active = priceRange.min === min && priceRange.max === max;
                    return (
                      <div
                        key={label}
                        onClick={() => setPriceRange(active ? { min: 0, max: Infinity } : { min, max })}
                        className={`filter-option-row ${active ? "active" : ""}`}
                      >
                        <div className={`filter-radio-indicator ${active ? "active" : ""}`} />
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="filter-drawer-footer">
              {hasActiveFilters && (
                <button
                  className="premium-btn-secondary filter-clear-btn"
                  onClick={() => {
                    resetFilters();
                    setShowFiltersDrawer(false);
                  }}
                >
                  Clear All
                </button>
              )}
              <button
                className="premium-btn-primary filter-apply-btn"
                onClick={() => setShowFiltersDrawer(false)}
              >
                View {filteredProducts.length} Results
              </button>
            </div>
          </div>

          {/* ── PRODUCT CATALOG GRID ── */}
          <div className="catalog-grid-full">
            {loading ? (
              /* Loading Skeleton */
              [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--card-bg)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      height: "200px",
                      background: "linear-gradient(90deg, var(--black) 25%, var(--border) 50%, var(--black) 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.4s infinite",
                    }}
                  />
                  <div style={{ padding: "1rem" }}>
                    <div
                      style={{
                        height: "14px",
                        background: "var(--border)",
                        borderRadius: "6px",
                        marginBottom: "8px",
                        width: "70%",
                      }}
                    />
                    <div
                      style={{
                        height: "12px",
                        background: "var(--border)",
                        borderRadius: "6px",
                        width: "50%",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div style={{ ...styles.emptyWrap, gridColumn: "1 / -1" }}>
                <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--white)",
                    marginBottom: "0.5rem",
                  }}
                >
                  No products found
                </h3>
                <p style={{ color: "var(--grey)", marginBottom: "1.5rem" }}>
                  Try a different category, price range, or search term
                </p>
                <button style={styles.emptyBtn} onClick={resetFilters}>
                  View All Products
                </button>
              </div>
            ) : (
              /* Products Grid */
              filteredProducts.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="premium-card"
                >
                  {/* Image */}
                  <div style={styles.imgWrap} className="premium-card__img-wrap">
                    <img src={p.image} alt={p.name} style={styles.img} className="premium-card__img" />

                    {/* Wishlist button */}
                    <button
                      style={styles.wishBtn(wishlist.includes(p._id))}
                      onClick={(e) => handleToggleWishlist(e, p._id)}
                      title={
                        wishlist.includes(p._id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      {wishlist.includes(p._id) ? "❤️" : "🤍"}
                    </button>

                    {/* Low stock badge */}
                    {p.stock !== undefined &&
                      p.stock <= 5 &&
                      p.stock > 0 && (
                        <span style={styles.lowStockBadge}>
                          Only {p.stock} left!
                        </span>
                      )}

                    {/* Out of stock overlay */}
                    {p.stock === 0 && (
                      <div style={styles.outOfStockOverlay}>
                        <span style={styles.outOfStockLabel}>
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={styles.cardBody} className="premium-card__body">
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.4rem" }} className="premium-card__badges">
                      <span style={{ fontSize: "0.68rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                        {p.category}
                      </span>
                      {p.subcategory && (
                        <>
                          <span style={{ fontSize: "0.68rem", color: "var(--grey)", opacity: 0.6 }}>•</span>
                          <span style={{ fontSize: "0.68rem", color: "var(--grey)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                            {p.subcategory}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 style={styles.cardName} className="premium-card__title">{p.name}</h3>
                    <p style={styles.cardDesc} className="premium-card__desc">{p.description}</p>
                    <div style={styles.cardBottom} className="premium-card__bottom">
                      <div style={{ display: "flex", flexDirection: "column" }} className="premium-card__price-container">
                        <p style={styles.price} className="premium-card__price">
                          ₹{p.price?.toLocaleString("en-IN")}
                        </p>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }} className="premium-card__discount">
                            <span style={{ fontSize: "0.72rem", color: "var(--grey)", textDecoration: "line-through" }}>₹{p.originalPrice.toLocaleString()}</span>
                            <span style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: 600 }}>{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, p._id)}
                        disabled={p.stock === 0}
                        style={styles.cartBtn(
                          addedId === p._id,
                          p.stock === 0
                        )}
                        className="premium-card__btn"
                      >
                        {addedId === p._id ? "✓ Added" : "+ Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div> {/* ── END catalog-layout-wrapper ── */}
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    </div>
  );
}

export default Products;
