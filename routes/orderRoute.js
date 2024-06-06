// routes/orderRoutes.js

const express = require("express");
const { authenticateToken } = require("../controllers/userController");
const { updateOrderStatus, getAllOrders, getUserOrders, placeOrder } = require("../controllers/orderController");

const router = express.Router();



// Route to update order status by orderId
router.put("/orders/:orderId/status/:status", authenticateToken, updateOrderStatus);

// Route to get all orders (for admins)
router.get("/orders", authenticateToken, getAllOrders);

// Route to get orders for a specific user (for customers)
router.get("/user/orders", authenticateToken, getUserOrders);

//place order by customer
router.put("/placeOrder/:orderId", authenticateToken, placeOrder);

module.exports = router;
