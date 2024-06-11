// routes/orderRoutes.js

const express = require("express");
const { authenticateToken } = require("../controllers/userController");
const { updateOrderStatus, getAllOrders, getUserOrders, placeOrder } = require("../controllers/orderController");

const router = express.Router();



module.exports = router;
