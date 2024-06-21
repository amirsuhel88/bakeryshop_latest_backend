const express = require("express");
const {  placeOrder, updateOrderStatus, isOrderSuccessful } = require("../controllers/OrderController");
const { authenticateToken } = require("../controllers/userController");
const router = express.Router();

//place order by customer
router.route("/placeOrder").get(authenticateToken, placeOrder);

// Route to update order status (admin only)
router.put('/orderstatus', authenticateToken, updateOrderStatus);
router.get('/isOrderSuccessful',authenticateToken, isOrderSuccessful )

module.exports = router;
