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
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80"
    ],
    stock: 50,
    specs: {
      "Brand": "Noise",
      "Model": "ColorFit Pulse",
      "Battery Life": "Up to 10 Days",
      "Screen Size": "1.4 inches"
    },
    variants: [
      {
        sku: "NOISE-PULSE-BLACK",
        price: 1499,
        stock: 30,
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80",
        attributes: { "color": "Black" }
      },
      {
        sku: "NOISE-PULSE-GREY",
        price: 1599,
        stock: 20,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80",
        attributes: { "color": "Grey" }
      }
    ]
  },
  {
    name: "OnePlus Nord Buds 2r",
    price: 1999,
    originalPrice: 2299,
    category: "Electronic",
    subcategory: "Audio",
    description: "True Wireless Earbuds with 12.4mm dynamic drivers, up to 38 hours playback, IP55 rating, and dual mics.",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=500&q=80"
    ],
    stock: 120,
    specs: {
      "Brand": "OnePlus",
      "Driver Size": "12.4 mm",
      "Battery Life": "Up to 38 Hours",
      "Water Resistance": "IP55"
    },
    variants: [
      {
        sku: "ONEPLUS-BUDS-BLACK",
        price: 1999,
        stock: 70,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80",
        attributes: { "color": "Black" }
      },
      {
        sku: "ONEPLUS-BUDS-WHITE",
        price: 2099,
        stock: 50,
        image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=500&q=80",
        attributes: { "color": "White" }
      }
    ]
  },
  {
    name: "Apple iPad (10th Generation)",
    price: 34900,
    originalPrice: 39900,
    category: "Electronic",
    subcategory: "Laptops",
    description: "10.9-inch Liquid Retina Display, A14 Bionic chip, 64GB, Wi-Fi 6, 12MP front/back cameras, Touch ID, and USB-C support.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80",
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80"],
    stock: 15,
    specs: {
      "Brand": "Apple",
      "Chipset": "A14 Bionic",
      "Storage": "64 GB",
      "Screen Size": "10.9 inches"
    },
    variants: []
  },
  
  // Fashion
  {
    name: "US Polo Association Men's Solid Polo Shirt",
    price: 999,
    originalPrice: 1999,
    category: "Fashion",
    subcategory: "Shirts",
    description: "Classic fit cotton polo shirt with signature brand embroidery, ribbed collar, and double-button placket.",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1588359348347-9bc6cbaa689f?auto=format&fit=crop&w=500&q=80"
    ],
    stock: 80,
    specs: {
      "Brand": "U.S. Polo Assn.",
      "Material": "100% Cotton",
      "Fit": "Classic Fit",
      "Sleeve": "Short Sleeve"
    },
    variants: [
      {
        sku: "US-POLO-RED-M",
        price: 999,
        stock: 40,
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80",
        attributes: { "color": "Red", "size": "M" }
      },
      {
        sku: "US-POLO-RED-L",
        price: 1099,
        stock: 20,
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80",
        attributes: { "color": "Red", "size": "L" }
      },
      {
        sku: "US-POLO-BLUE-M",
        price: 999,
        stock: 20,
        image: "https://images.unsplash.com/photo-1588359348347-9bc6cbaa689f?auto=format&fit=crop&w=500&q=80",
        attributes: { "color": "Blue", "size": "M" }
      }
    ]
  },
  {
    name: "Levi's Men's 511 Slim Fit Jeans",
    price: 2199,
    originalPrice: 3899,
    category: "Fashion",
    subcategory: "Jeans",
    description: "A modern slim with room to move, these jeans are a classic choice for everyday wear.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80"],
    stock: 45,
    specs: {
      "Brand": "Levi's",
      "Fit": "Slim Fit",
      "Material": "Stretch Denim",
      "Closure": "Button Fly"
    },
    variants: []
  },

  // Accessories
  {
    name: "Fossil Grant Chronograph Leather Watch",
    price: 8999,
    originalPrice: 12495,
    category: "Accessories",
    subcategory: "Watches",
    description: "Roman numeral markers with a rich blue dial and genuine brown leather strap for a timeless, formal look.",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80",
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80"],
    stock: 25,
    specs: {
      "Brand": "Fossil",
      "Movement": "Quartz Chronograph",
      "Strap Material": "Genuine Leather",
      "Water Resistance": "50 meters"
    },
    variants: []
  },
  {
    name: "Tommy Hilfiger Men's Leather Wallet",
    price: 1800,
    originalPrice: 2999,
    category: "Accessories",
    subcategory: "Bags",
    description: "Bifold passcase wallet with multiple card slots, a bill compartment, and removable passcase window.",
    image: "https://images.unsplash.com/photo-1627124765135-5655653443a4?auto=format&fit=crop&w=500&q=80",
    images: ["https://images.unsplash.com/photo-1627124765135-5655653443a4?auto=format&fit=crop&w=500&q=80"],
    stock: 90,
    specs: {
      "Brand": "Tommy Hilfiger",
      "Material": "100% Leather",
      "Style": "Bifold",
      "Card Capacity": "8 Cards"
    },
    variants: []
  },

  // Home
  {
    name: "Philips Smart Wi-Fi LED Bulb (9W)",
    price: 699,
    originalPrice: 1299,
    category: "Home",
    subcategory: "Lighting",
    description: "B22 smart bulb compatible with Alexa and Google Assistant. Control brightness and choose from millions of colors.",
    image: "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=500&q=80",
    images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=500&q=80"],
    stock: 200,
    specs: {
      "Brand": "Philips",
      "Wattage": "9 Watts",
      "Fitting": "B22",
      "Control": "Wi-Fi App / Voice"
    },
    variants: []
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
