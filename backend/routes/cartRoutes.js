const express=require("express");
const router=express.Router();
const {placeOrder,getOrders}=require("../controllers/orderController");


const authMiddleware = require("../middleware/authMiddleware");
const {incrementItem,decrementItem,removeItem,addToCart,getCart}=require("../controllers/cartController")


router.post("/add", authMiddleware, addToCart);              // add item
router.get("/", authMiddleware, getCart);  
router.get("/place", authMiddleware, placeOrder);
router.get("/",authMiddleware,getOrders);
router.put("/:itemId/increment", authMiddleware, incrementItem);
router.put("/:itemId/decrement", authMiddleware, decrementItem);
router.delete("/:itemId/remove", authMiddleware, removeItem);

module.exports=router;