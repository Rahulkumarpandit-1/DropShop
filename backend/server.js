require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");
const app = express();

// ✅ CORS must be FIRST
let frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl) {
  frontendUrl = frontendUrl.trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, "");
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175"
];

if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any Vercel or Netlify subdomains
    if (origin.endsWith(".vercel.app") || origin.endsWith(".netlify.app") || origin.includes("vercel.app") || origin.includes("netlify.app")) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json());

// session & passport after cors
const session = require("express-session");
const passport = require("./middleware/passport");

app.use(session({
  secret: process.env.SESSION_SECRET || process.env.GOOGLE_CLIENT_ID || "dropshop_fallback_session_secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const seedAdmin = async () => {
  try {
    const adminPhone = process.env.SEED_ADMIN_PHONE || "6399400242";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "rahulkumar99rah@gmail.com";
    const adminName = process.env.SEED_ADMIN_NAME || "Rahul";

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

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("Database has no products. Auto-seeding sample products...");
      const sampleProducts = [
        {
          name: "Noise ColorFit Pulse Smartwatch",
          price: 1499,
          originalPrice: 4999,
          category: "Electronic",
          subcategory: "Accessories",
          description: "1.4'' Full Touch Display smart watch with 10-day battery life, heart rate monitor, sleep tracker, and sports modes.",
          image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80",
          stock: 50,
          specs: {
            "Brand": "Noise",
            "Model": "ColorFit Pulse",
            "Battery Life": "Up to 10 Days",
            "Screen Size": "1.4 inches"
          }
        },
        {
          name: "OnePlus Nord Buds 2r",
          price: 1999,
          originalPrice: 2299,
          category: "Electronic",
          subcategory: "Audio",
          description: "True Wireless Earbuds with 12.4mm dynamic drivers, up to 38 hours playback, IP55 rating, and dual mics.",
          image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80",
          stock: 120,
          specs: {
            "Brand": "OnePlus",
            "Driver Size": "12.4 mm",
            "Battery Life": "Up to 38 Hours",
            "Water Resistance": "IP55"
          }
        },
        {
          name: "Apple iPad (10th Generation)",
          price: 34900,
          originalPrice: 39900,
          category: "Electronic",
          subcategory: "Laptops",
          description: "10.9-inch Liquid Retina Display, A14 Bionic chip, 64GB, Wi-Fi 6, 12MP front/back cameras, Touch ID, and USB-C support.",
          image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80",
          stock: 15,
          specs: {
            "Brand": "Apple",
            "Chipset": "A14 Bionic",
            "Storage": "64 GB",
            "Screen Size": "10.9 inches"
          }
        },
        {
          name: "US Polo Association Men's Solid Polo Shirt",
          price: 999,
          originalPrice: 1999,
          category: "Fashion",
          subcategory: "Shirts",
          description: "Classic fit cotton polo shirt with signature brand embroidery, ribbed collar, and double-button placket.",
          image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80",
          stock: 80,
          specs: {
            "Brand": "U.S. Polo Assn.",
            "Material": "100% Cotton",
            "Fit": "Classic Fit",
            "Sleeve": "Short Sleeve"
          }
        },
        {
          name: "Levi's Men's 511 Slim Fit Jeans",
          price: 2199,
          originalPrice: 3899,
          category: "Fashion",
          subcategory: "Jeans",
          description: "A modern slim with room to move, these jeans are a classic choice for everyday wear.",
          image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
          stock: 45,
          specs: {
            "Brand": "Levi's",
            "Fit": "Slim Fit",
            "Material": "Stretch Denim",
            "Closure": "Button Fly"
          }
        },
        {
          name: "Fossil Grant Chronograph Leather Watch",
          price: 8999,
          originalPrice: 12495,
          category: "Accessories",
          subcategory: "Watches",
          description: "Roman numeral markers with a rich blue dial and genuine brown leather strap for a timeless, formal look.",
          image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80",
          stock: 25,
          specs: {
            "Brand": "Fossil",
            "Movement": "Quartz Chronograph",
            "Strap Material": "Genuine Leather",
            "Water Resistance": "50 meters"
          }
        },
        {
          name: "Tommy Hilfiger Men's Leather Wallet",
          price: 1800,
          originalPrice: 2999,
          category: "Accessories",
          subcategory: "Bags",
          description: "Bifold passcase wallet with multiple card slots, a bill compartment, and removable passcase window.",
          image: "https://images.unsplash.com/photo-1627124765135-5655653443a4?auto=format&fit=crop&w=500&q=80",
          stock: 90,
          specs: {
            "Brand": "Tommy Hilfiger",
            "Material": "100% Leather",
            "Style": "Bifold",
            "Card Capacity": "8 Cards"
          }
        },
        {
          name: "Philips Smart Wi-Fi LED Bulb (9W)",
          price: 699,
          originalPrice: 1299,
          category: "Home",
          subcategory: "Lighting",
          description: "B22 smart bulb compatible with Alexa and Google Assistant. Control brightness and choose from millions of colors.",
          image: "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=500&q=80",
          stock: 200,
          specs: {
            "Brand": "Philips",
            "Wattage": "9 Watts",
            "Fitting": "B22",
            "Control": "Wi-Fi App / Voice"
          }
        }
      ];
      await Product.insertMany(sampleProducts);
      console.log("Database successfully seeded with sample products.");
    }
  } catch (err) {
    console.error("Error auto-seeding products:", err);
  }
};

let MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  MONGODB_URI = MONGODB_URI.trim().replace(/^['"]|['"]$/g, "");
}
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    seedAdmin();
    seedProducts();
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));