const mongoose = require("mongoose");
const Product = require("./models/Product");

const sampleProducts = [
  // Electronics
  {
    name: "Noise ColorFit Pulse Smartwatch",
    price: 1499,
    originalPrice: 4999,
    category: "Electronic",
    subcategory: "Accessories",
    description: "1.4'' Full Touch Display smart watch with 10-day battery life, heart rate monitor, sleep tracker, and sports modes.",
    image: "https://images-eu.ssl-images-amazon.com/images/I/61A2LhE6-FL._AC_UL450_SR450,320_.jpg",
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
    image: "https://images-eu.ssl-images-amazon.com/images/I/514NPRZ052L._AC_UL450_SR450,320_.jpg",
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
    image: "https://images-eu.ssl-images-amazon.com/images/I/61goy46A3nL._AC_UL450_SR450,320_.jpg",
    stock: 15,
    specs: {
      "Brand": "Apple",
      "Chipset": "A14 Bionic",
      "Storage": "64 GB",
      "Screen Size": "10.9 inches"
    }
  },
  
  // Fashion
  {
    name: "US Polo Association Men's Solid Polo Shirt",
    price: 999,
    originalPrice: 1999,
    category: "Fashion",
    subcategory: "Shirts",
    description: "Classic fit cotton polo shirt with signature brand embroidery, ribbed collar, and double-button placket.",
    image: "https://images-eu.ssl-images-amazon.com/images/I/71c6t3m-mVL._AC_UL450_SR450,320_.jpg",
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
    image: "https://images-eu.ssl-images-amazon.com/images/I/611hn0B6HUL._AC_UL450_SR450,320_.jpg",
    stock: 45,
    specs: {
      "Brand": "Levi's",
      "Fit": "Slim Fit",
      "Material": "Stretch Denim",
      "Closure": "Button Fly"
    }
  },

  // Accessories
  {
    name: "Fossil Grant Chronograph Leather Watch",
    price: 8999,
    originalPrice: 12495,
    category: "Accessories",
    subcategory: "Watches",
    description: "Roman numeral markers with a rich blue dial and genuine brown leather strap for a timeless, formal look.",
    image: "https://images-eu.ssl-images-amazon.com/images/I/71y1ZpL-8vL._AC_UL450_SR450,320_.jpg",
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
    image: "https://images-eu.ssl-images-amazon.com/images/I/61b7LhE6-FL._AC_UL450_SR450,320_.jpg",
    stock: 90,
    specs: {
      "Brand": "Tommy Hilfiger",
      "Material": "100% Leather",
      "Style": "Bifold",
      "Card Capacity": "8 Cards"
    }
  },

  // Home
  {
    name: "Philips Smart Wi-Fi LED Bulb (9W)",
    price: 699,
    originalPrice: 1299,
    category: "Home",
    subcategory: "Lighting",
    description: "B22 smart bulb compatible with Alexa and Google Assistant. Control brightness and choose from millions of colors.",
    image: "https://images-eu.ssl-images-amazon.com/images/I/51bA2LhE6-FL._AC_UL450_SR450,320_.jpg",
    stock: 200,
    specs: {
      "Brand": "Philips",
      "Wattage": "9 Watts",
      "Fitting": "B22",
      "Control": "Wi-Fi App / Voice"
    }
  }
];

const seedDB = async () => {
  try {
    require("dotenv").config();
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/products";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");
    
    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared old products.");
    
    // Insert new ones
    await Product.insertMany(sampleProducts);
    console.log("Database seeded successfully with sample products!");
    
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
