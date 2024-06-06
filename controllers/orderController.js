const express = require("express")
const mysql = require("mysql");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlinebakeryshop",
});


// Function to update order status
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { orderId, status } = req.params;
  const validStatus = ['0', '1', '2', '3', '4']; // Valid statuses

  if (!validStatus.includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status provided" });
  }

  const updateSql = "UPDATE cart SET status = ? WHERE CartId = ?";
  
  try {
    await db.query(updateSql, [status, orderId]);
    
    res.status(200).json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, error: "Failed to update order status" });
  }
});

// Function to get all orders (for admins)
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const sql = `
    SELECT c.CartId, c.UserId, c.ProductId, c.quantity, c.status, 
           p.ProductName, p.description, p.Price, p.CategoryName
    FROM cart c
    JOIN products p ON c.ProductId = p.ProductId
  `;
  
  try {
    const orders = await db.query(sql);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

// Function to get orders for a specific user (for customers)
exports.getUserOrders = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.userId;

  const sql = `
    SELECT c.CartId, c.UserId, c.ProductId, c.quantity, c.status, 
           p.ProductName, p.description, p.Price, p.CategoryName
    FROM cart c
    JOIN products p ON c.ProductId = p.ProductId
    WHERE c.UserId = ?
  `;

  try {
    const userOrders = await db.query(sql, [userId]);
    res.json(userOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user orders" });
  }
});


//funtion to place order button for customer. 
//user will place order when click this button the "status" attribute's value will change from 0 to 1.
// Function to place an order

exports.placeOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.userId; // Assuming the user ID is available in the request

  const getOrderSql = "SELECT status FROM cart WHERE CartId = ? AND UserId = ?";
  const updateOrderSql = "UPDATE cart SET status = '1' WHERE CartId = ? AND UserId = ?";

  try {
    const order = await db.query(getOrderSql, [orderId, userId]);

    if (order.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (order[0].status !== '0') {
      return res.status(400).json({ success: false, error: "Order cannot be placed" });
    }

    await db.query(updateOrderSql, [orderId, userId]);

    res.status(200).json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
});

