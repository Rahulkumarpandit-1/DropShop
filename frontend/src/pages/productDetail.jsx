import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart, getCart, addReview, getReviews, deleteReview, BASE_URL } from "../services/api";
import toast from "react-hot-toast";


function ProductDetail() {
  // ── ALL STATES FIRST ──
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // ── ALL EFFECTS ──
  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (product) {
      document.title = `DropShop | Buy ${product.name}`;
    } else {
      document.title = "DropShop | Product Details";
    }
  }, [product]);

  // ── ALL FUNCTIONS ──
  const fetchProduct = async () => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    const data = await res.json();
    setProduct(data);
    setLoading(false);
  };

  const fetchReviews = async () => {
    console.log("fetching reviews for id:", id);
    const data = await getReviews(id);
    setReviews(data.reviews || []);
    setAvgRating(data.avgRating || 0);
    setTotalReviews(data.total || 0);
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    await addToCart(product._id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to buy products");
      return;
    }
    try {
      setLoading(true);
      await addToCart(product._id);
      const fetchedCart = await getCart();
      const items = fetchedCart.items || [];
      const cartItem = items.find(
        item => item.productId.toString() === product._id.toString()
      );
      setLoading(false);
      if (cartItem) {
        navigate("/checkout", { state: { itemId: cartItem._id } });
      } else {
        navigate("/checkout");
      }
    } catch (err) {
      setLoading(false);
      console.error("Buy Now error:", err);
      toast.error("Failed to proceed to checkout");
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating) return setReviewMessage("Please select a rating");
    if (!comment.trim()) return setReviewMessage("Please write a comment");
    setSubmitting(true);
    const res = await addReview({ productId: id, rating: userRating, comment });
    setSubmitting(false);
    if (res.review) {
      setReviewMessage("✓ Review submitted!");
      setUserRating(0);
      setComment("");
      fetchReviews();
    } else {
      setReviewMessage(res.error || "Something went wrong");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    await deleteReview(reviewId);
    fetchReviews();
  };

  if (loading) return (
    <div style={{ background: "#fafafa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #f0f0f0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
        <p style={{ color: "#999", fontFamily: "Inter, sans-serif", fontSize: "0.9rem" }}>Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ background: "#fafafa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#999", fontFamily: "Inter, sans-serif" }}>Product not found.</p>
    </div>
  );

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", padding: "80px 2rem 4rem", color: "var(--white)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem" }}>
          <span
            onClick={() => navigate("/")}
            style={{ fontSize: "0.82rem", color: "var(--grey)", cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--grey)"}
          >Home</span>
          <span style={{ color: "var(--border)", fontSize: "0.82rem" }}>›</span>
          <span style={{ fontSize: "0.82rem", color: "var(--white)", fontWeight: 500 }}>{product.name}</span>
        </div>

        {/* Product Layout */}
        <div className="detail-grid">

          {/* Left — Image */}
          <div>
            <div style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "2.5rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: "420px",
              position: "relative"
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", maxHeight: "360px", objectFit: "contain" }}
              />
              {/* Stock badge on image */}
              {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                <span style={{
                  position: "absolute", top: "16px", right: "16px",
                  background: "#fff3e0", color: "#e65100",
                  border: "1px solid #ffcc80",
                  fontSize: "0.72rem", fontWeight: 600,
                  padding: "0.3rem 0.75rem", borderRadius: "980px"
                }}>Only {product.stock} left!</span>
              )}
              {product.stock === 0 && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(255,255,255,0.85)",
                  borderRadius: "24px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <span style={{ color: "#999", fontWeight: 600, fontSize: "0.9rem", background: "#f0f0f0", padding: "0.5rem 1.25rem", borderRadius: "980px" }}>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Trust badges below image */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "1rem" }}>
              {[
                { icon: "🔒", label: "Secure" },
                { icon: "🚚", label: "Free Delivery" },
                { icon: "↩️", label: "7 Day Return" },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  background: "var(--card-bg)", border: "1px solid var(--border)",
                  borderRadius: "12px", padding: "0.75rem",
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: "1.1rem", margin: "0 0 0.2rem" }}>{icon}</p>
                  <p style={{ fontSize: "0.7rem", color: "#888", margin: 0, fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Details */}
          <div>
            {/* Category tag */}
            {product.category && (
              <span style={{
                background: "rgba(255,255,255,0.06)", color: "var(--accent)",
                fontSize: "0.72rem", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "0.3rem 0.85rem", borderRadius: "980px",
                display: "inline-block", marginBottom: "1rem"
              }}>{product.category}</span>
            )}

            <h1 style={{
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 600, color: "var(--white)",
              fontFamily: "Cormorant Garamond, serif",
              lineHeight: 1.2, marginBottom: "0.75rem"
            }}>
              {product.name}
            </h1>

            {/* Stock status */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: product.stock > 0 ? "var(--success)" : "var(--error)"
              }} />
              <p style={{ fontSize: "0.82rem", color: product.stock > 0 ? "var(--success)" : "var(--error)", fontWeight: 500, margin: 0 }}>
                {product.stock > 5 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
              </p>
            </div>

            {/* Price */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
                <p style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--accent)", margin: 0, lineHeight: 1 }}>
                  ₹{product.price?.toLocaleString()}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <p style={{ fontSize: "1.2rem", color: "var(--grey)", textDecoration: "line-through", margin: 0 }}>
                      ₹{product.originalPrice?.toLocaleString()}
                    </p>
                    <p style={{ fontSize: "1rem", color: "var(--success)", fontWeight: 700, margin: 0 }}>
                      ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)
                    </p>
                  </>
                )}
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--success)", margin: "0.3rem 0 0", fontWeight: 500 }}>
                Free delivery included
              </p>
            </div>

            {/* Description */}
            <p style={{ fontSize: "0.9rem", color: "var(--grey)", lineHeight: 1.8, marginBottom: "2rem" }}>
              {product.description}
            </p>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.75rem" }} />

            {/* Delivery Info */}
            <div style={{ background: "rgba(0,0,0,0.01)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem" }}>
              {[
                { icon: "🚚", label: "Free Delivery", sub: "Delivered to your door" },
                { icon: "💵", label: "Cash on Delivery", sub: "Pay when you receive" },
                { icon: "↩️", label: "Easy Returns", sub: "7 day hassle-free returns" },
              ].map(({ icon, label, sub }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.85rem" }}>
                  <span style={{ fontSize: "1.2rem", width: "28px", textAlign: "center" }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "var(--white)", fontWeight: 600, margin: 0 }}>{label}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--grey)", margin: 0 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pincode Estimator */}
            <div style={{ background: "rgba(0,0,0,0.01)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.25rem", marginBottom: "2rem" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--white)", margin: "0 0 0.5rem" }}>Delivery Estimator</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  maxLength={6}
                  id="pincode-input"
                  style={{
                    background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)",
                    borderRadius: "8px", padding: "0.5rem 0.75rem", fontSize: "0.82rem",
                    color: "var(--white)", width: "160px", outline: "none"
                  }}
                />
                <button
                  onClick={() => {
                    const pin = document.getElementById("pincode-input")?.value;
                    if (pin && pin.length === 6 && /^\d+$/.test(pin)) {
                      const deliveryDate = new Date();
                      deliveryDate.setDate(deliveryDate.getDate() + 3);
                      const formattedDate = deliveryDate.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" });
                      toast.success(`Express Delivery Available!`);
                      document.getElementById("pincode-result").innerText = `🚚 Get it by ${formattedDate} (Express Shipping)`;
                      document.getElementById("pincode-result").style.color = "var(--success)";
                    } else {
                      toast.error("Please enter a valid 6-digit Pincode");
                      document.getElementById("pincode-result").innerText = "❌ Invalid pincode";
                      document.getElementById("pincode-result").style.color = "var(--error)";
                    }
                  }}
                  style={{
                    background: "var(--accent)", color: "var(--black)", border: "none",
                    borderRadius: "8px", padding: "0.5rem 1.25rem", fontSize: "0.82rem",
                    fontWeight: 600, cursor: "pointer"
                  }}
                >
                  Check
                </button>
              </div>
              <p id="pincode-result" style={{ fontSize: "0.78rem", color: "var(--grey)", margin: "0.6rem 0 0" }}>
                Enter your pincode to check estimated delivery dates.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  flex: 1, padding: "1rem",
                  background: added ? "var(--success)" : "var(--white)",
                  color: added ? "var(--black)" : "#ffffffff", border: "none",
                  borderRadius: "980px", fontSize: "0.9rem",
                  fontWeight: 600, cursor: product.stock === 0 ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s ease",
                  opacity: product.stock === 0 ? 0.5 : 1
                }}
              >
                {added ? "✓ Added to Cart" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                style={{
                  flex: 1, padding: "1rem",
                  background: "transparent", color: "var(--white)",
                  border: "2px solid var(--border)",
                  borderRadius: "980px", fontSize: "0.9rem",
                  fontWeight: 600, cursor: product.stock === 0 ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s ease",
                  opacity: product.stock === 0 ? 0.5 : 1
                }}
                onMouseEnter={e => { if (product.stock !== 0) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--white)"; }}
              >
                Buy Now
              </button>
            </div>

            {/* Specs Table */}
            <div style={{ marginTop: "2rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--white)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product Specifications</h4>
              <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                {Object.entries(
                  product.specs && Object.keys(product.specs).length > 0
                    ? product.specs
                    : {
                      "Brand": "DropShop Premium",
                      "Category": product.category || "General",
                      "Stock Status": product.stock > 0 ? "In Stock" : "Out of Stock",
                      "Warranty": "1 Year Manufacturer Warranty",
                      "Estimated Shipping": "Ships in 24-48 Hours",
                      "Country of Origin": "India"
                    }
                ).map(([key, val], idx, arr) => (
                  <div key={key} style={{
                    display: "flex",
                    fontSize: "0.82rem",
                    borderBottom: idx === arr.length - 1 ? "none" : "1px solid var(--border)",
                    background: idx % 2 === 0 ? "rgba(0,0,0,0.01)" : "transparent"
                  }}>
                    <div style={{ width: "140px", padding: "0.75rem 1rem", color: "var(--grey)", fontWeight: 500, borderRight: "1px solid var(--border)" }}>{key}</div>
                    <div style={{ padding: "0.75rem 1rem", color: "var(--white)", flex: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS SECTION ── */}
      <div style={{ marginTop: "4rem" }}>

        {/* Rating Summary */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem", background: "var(--card-bg)",
          border: "1px solid var(--border)", borderRadius: "20px",
          padding: "2rem", marginBottom: "2rem"
        }}>
          <div style={{ textAlign: "center", borderRight: "1px solid var(--border)", paddingRight: "2rem" }}>
            <p style={{ fontSize: "4rem", fontWeight: 800, color: "var(--white)", margin: 0, lineHeight: 1 }}>
              {avgRating}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "2px", margin: "0.5rem 0" }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} style={{ fontSize: "1.2rem", color: star <= Math.round(avgRating) ? "#f59e0b" : "rgba(255,255,255,0.15)" }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--grey)", margin: 0 }}>{totalReviews} reviews</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5rem" }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const percent = totalReviews ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--grey)", width: "12px" }}>{star}</span>
                  <span style={{ fontSize: "0.9rem", color: "#f59e0b" }}>★</span>
                  <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "980px", overflow: "hidden" }}>
                    <div style={{ width: `${percent}%`, height: "100%", background: "#f59e0b", borderRadius: "980px", transition: "width 0.3s ease" }} />
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--grey)", width: "24px" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review */}
        {localStorage.getItem("token") && (
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "20px", padding: "2rem", marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--white)", margin: "0 0 1.25rem", fontFamily: "Cormorant Garamond, serif" }}>Write a Review</h3>

            {/* Star Selector */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    fontSize: "2rem", cursor: "pointer",
                    color: star <= (hoverRating || userRating) ? "#f59e0b" : "rgba(255,255,255,0.15)",
                    transition: "color 0.15s ease"
                  }}
                >★</span>
              ))}
              {userRating > 0 && (
                <span style={{ fontSize: "0.85rem", color: "var(--grey)", alignSelf: "center", marginLeft: "0.5rem" }}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][userRating]}
                </span>
              )}
            </div>

            {/* Comment */}
            <textarea
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              style={{
                width: "100%", padding: "0.85rem 1rem",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px",
                fontSize: "0.88rem", color: "var(--white)", fontFamily: "Inter, sans-serif",
                outline: "none", resize: "vertical", marginBottom: "1rem",
                boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            />

            {reviewMessage && (
              <p style={{
                fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.75rem",
                color: reviewMessage.startsWith("✓") ? "var(--success)" : "var(--error)"
              }}>{reviewMessage}</p>
            )}

            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              style={{
                background: "var(--accent)", color: "var(--black)", border: "none",
                borderRadius: "980px", padding: "0.75rem 2rem",
                fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                fontFamily: "Inter, sans-serif", opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {/* Reviews List */}
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--white)", margin: "0 0 1rem", fontFamily: "Cormorant Garamond, serif" }}>
          Customer Reviews ({totalReviews})
        </h3>

        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "20px" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</p>
            <p style={{ color: "var(--grey)", fontSize: "0.9rem" }}>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map(review => (
              <div key={review._id} style={{
                background: "var(--card-bg)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "1.5rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)", color: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem", fontWeight: 700, flexShrink: 0
                    }}>
                      {review.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "var(--white)" }}>{review.name}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--grey)" }}>
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "1px" }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ fontSize: "0.9rem", color: star <= review.rating ? "#f59e0b" : "rgba(255,255,255,0.15)" }}>★</span>
                      ))}
                    </div>
                    {/* Delete button — only show for own reviews */}
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      style={{
                        background: "transparent", border: "none",
                        color: "var(--border)", cursor: "pointer", fontSize: "0.8rem",
                        padding: "0.2rem 0.5rem", borderRadius: "6px",
                        marginLeft: "0.5rem"
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--error)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--border)"}
                    >✕</button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--white)", opacity: 0.9, lineHeight: 1.7 }}>
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>

  );
};
export default ProductDetail;