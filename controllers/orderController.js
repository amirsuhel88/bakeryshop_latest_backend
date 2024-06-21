const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlinebakeryshop",
});

//Place order by customer
exports.placeOrder = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.userId; // Assuming you are extracting user ID from authenticated user
  // Update cart status to 1 (order placed) and orderStatus to 0 (pending)
  const placeOrderQuery =
    "UPDATE cart SET status = 1, orderStatus = 0 WHERE userId = ? AND status = 0";
  db.query(placeOrderQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error placing order:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to place order" });
    }
    return res.status(200).json({
      success: true,
      message: "Order placed successfully, awaiting admin approval",
    });
  });
});

//order accept/ reject/ intrasit/ delivered by admin

exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
    // const { cartId, orderStatus, rejectReason } = req.body;
    const { userId, orderStatus, rejectReason } = req.body;
    // const cartQuery = "Select * From cart WHERE cartId =?";
    // db.query(cartQuery, [cartId], (err, res)=>{
    //   if(err){

    //   }
    // })
    // console.log(cartQuery);
    // Check if the user is an admin
    let isAdmin = false
    isAdmin =  1;
    // console.log(res)
  
    // If the user is not an admin, return a 403 Forbidden response
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
  
    // SQL query to update the orderStatus and rejectReason for the specified cartId

    // const updateOrderStatusQuery = "UPDATE cart SET orderStatus = ?, rejectReason = ? WHERE cartId = ?";
    //changed by me
    const updateOrderStatusQuery = "UPDATE cart SET orderStatus = ?, rejectReason = ? WHERE userId = ?";
  
    // Execute the query to update the order status
    // db.query(updateOrderStatusQuery, [orderStatus, rejectReason || null, cartId], (err, results) => {
    db.query(updateOrderStatusQuery, [orderStatus, rejectReason || null, userId], (err, results) => {
      if (err) {
        // Log the error and return a 500 response if there's a database error
        console.error("Error updating order status:", err);
        return res.status(500).json({ success: false, error: "Failed to update order status" });
      }
  
      // If the orderStatus is set to 1 (accepted), update it further to 3 (in transit)
      if (orderStatus === 1 ) {
        // SQL query to set the orderStatus to 3 (in transit) if the status is 1 (ordered) and orderStatus is 1 (accepted)
        // const setInTransitQuery = "UPDATE cart SET orderStatus = 3 WHERE cartId = ? AND status = 1 AND orderStatus = 1";
        const setInTransitQuery = "UPDATE cart SET orderStatus = 3 WHERE userId = ? AND status = 1 AND orderStatus = 1";
        
        // Execute the query to set the order in transit
        // db.query(setInTransitQuery, [cartId], (err, transitResults) => {
        db.query(setInTransitQuery, [userId], (err, transitResults) => {
          if (err) {
            // Log the error and return a 500 response if there's a database error while setting in transit
            console.error("Error setting order in transit:", err);
            return res.status(500).json({ success: false, error: "Failed to update order to in transit" });
          }
        });
      }
  
      // Return a success response indicating the order status has been updated successfully
      return res.status(200).json({ success: true, message: "Order status updated successfully" });
    });
  });


  //order successful
  
// Function to check if the order is successful
exports.isOrderSuccessful = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.userId; // Assuming you are extracting user ID from authenticated user

  // SQL query to check if the order is successful
  const checkOrderStatusQuery = `
    SELECT status, orderStatus 
    FROM cart 
    WHERE userId = ? AND status = 1 AND (orderStatus = 1 OR orderStatus = 3)
  `;

  // Execute the query to check the order status
  db.query(checkOrderStatusQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error checking order status:", err);
      return res.status(500).json({ success: false, error: "Failed to check order status" });
    }

    // Determine if the order is successful based on the query results
    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Order is successful",
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Order is not successful",
      });
    }
  });
});
  
