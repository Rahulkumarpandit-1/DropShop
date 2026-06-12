const Review = require("../models/Review");
const User = require("../models/User");

// ADD REVIEW
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    // check if already reviewed
    const existing = await Review.findOne({ productId, userId });
    if (existing) {
      return res.status(400).json({ error: "You have already reviewed this product" });
    }

    const user = await User.findById(userId);

    const review = new Review({
      productId,
      userId,
      name: user.name,
      rating,
      comment
    });

    await review.save();
    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    console.log("addReview error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET REVIEWS FOR PRODUCT
exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    res.json({ reviews, avgRating: avgRating.toFixed(1), total: reviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE REVIEW
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.userId.toString() !== userId)
      return res.status(403).json({ error: "Not authorized" });

    await Review.findByIdAndDelete(reviewId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};