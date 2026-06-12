const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addReview, getReviews, deleteReview } = require("../controllers/reviewController");

router.post("/", auth, addReview);
router.get("/:productId", getReviews);
router.delete("/:reviewId", auth, deleteReview);

module.exports = router;