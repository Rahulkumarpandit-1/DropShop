require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const app = express();

// ✅ CORS must be FIRST
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// session & passport after cors
const session = require("express-session");
const passport = require("./middleware/passport");

app.use(session({
  secret: process.env.GOOGLE_CLIENT_ID,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const seedAdmin = async () => {
  try {
    const adminPhone = process.env.SEED_ADMIN_PHONE || "9999999999";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "demo.admin@dropshop.com";
    const adminName = process.env.SEED_ADMIN_NAME || "Demo Admin";

    const adminExists = await User.findOne({ phone: adminPhone });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new User({
        name: adminName,
        phone: adminPhone,
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      await newAdmin.save();
      console.log(`Default admin user created: ${adminPhone} / ${adminPassword}`);
    } else {
      console.log("Admin user already exists");
    }
  } catch (err) {
    console.error("Error seeding default admin:", err);
  }
};

mongoose.connect("mongodb://localhost:27017/products")
  .then(() => {
    console.log("MongoDB connected");
    seedAdmin();
  })
  .catch((err) => console.log(err));

// routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/payment");
const reviewRoutes = require("./routes/review");
const wishlistRoutes = require("./routes/wishlist");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("Backend running"));

app.listen(3000, () => console.log("Server running on port 3000"));