const express = require("express");
const {addToCart, getCartItems, removeFromCart} = require("../controllers/CartController");
const {authenticateToken} = require("../controllers/userController");
const router = express.Router();

router.route("/cartItems").get(authenticateToken,getCartItems);
router.route("/addToCart/:productId").post(authenticateToken, addToCart);
router.delete("/cart/:productId", authenticateToken, removeFromCart);
module.exports = router;
