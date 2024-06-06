const express = require("express");
const {addToCart, getCartItems} = require("../controllers/CartController");
const {authenticateToken} = require("../controllers/userController");
const router = express.Router();

router.route("/cartItems").get(authenticateToken,getCartItems);
router.route("/addToCart/:productId").post(authenticateToken, addToCart);
module.exports = router;
