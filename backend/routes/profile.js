const express = require("express");
const router = express.Router();
const auth=require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  updateAddress,
  addAddress,
  updateAddressItem,
  deleteAddressItem,
  setDefaultAddress
} = require("../controllers/profileController");

router.get("/", auth, getProfile);
router.put("/update", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.put("/address", auth, updateAddress);

// Multi-address routes
router.post("/addresses", auth, addAddress);
router.put("/addresses/:addressId", auth, updateAddressItem);
router.delete("/addresses/:addressId", auth, deleteAddressItem);
router.patch("/addresses/:addressId/default", auth, setDefaultAddress);

module.exports = router;