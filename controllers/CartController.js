const express = require("express");
const mysql = require("mysql");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlinebakeryshop",
});
/*
// Add to cart
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.user);
  const userId = req.user.userId;
  const productId = req.params.productId;
  // console.log(productId);

  // Check if the product with given productId exists
  const productExistsQuery = "SELECT * FROM products WHERE ProductId = ?";
  db.query(productExistsQuery, [productId], async (err, results) => {
    if (err) {
      console.error("Error checking product existence:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Check if the product is already in the user's cart
    const cartCheckQuery =
      "SELECT * FROM cart WHERE userId = ? AND productId = ?";
    db.query(cartCheckQuery, [userId, productId], async (err, cartResults) => {
      if (err) {
        console.error("Error checking cart:", err);
        return res
          .status(500)
          .json({ success: false, error: "Database error" });
      }

      if (cartResults.length > 0) {
        // Product is already in the cart, update the quantity
        const updateCartQuery =
          "UPDATE cart SET quantity = quantity + 1 WHERE userId = ? AND productId = ?";
        db.query(updateCartQuery, [userId, productId], (err, updateResults) => {
          if (err) {
            console.error("Error updating cart:", err);
            return res
              .status(500)
              .json({ success: false, error: "Failed to update cart" });
          }
          return res
            .status(200)
            .json({ success: true, message: "Cart updated successfully" });
        });
      } else {
        // Product is not in the cart, insert a new row
        const insertCartQuery =
          "INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, 1)";
        db.query(insertCartQuery, [userId, productId], (err, insertResults) => {
          if (err) {
            console.error("Error inserting into cart:", err);
            return res
              .status(500)
              .json({ success: false, error: "Failed to add item to cart" });
          }
          return res
            .status(201)
            .json({
              success: true,
              message: "Item added to cart successfully",
            });
        });
      }
    });
  });
});
*/

//add to cart
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.userId;
  const productId = req.params.productId;

  // Check if the product with the given productId exists
  const productExistsQuery = "SELECT * FROM products WHERE productId = ?";
  db.query(productExistsQuery, [productId], async (err, results) => {
    if (err) {
      console.error("Error checking product existence:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Check if the product is already in the user's cart with status = 0
    const cartCheckQuery = "SELECT * FROM cart WHERE userId = ? AND productId = ? AND status = 0";
    db.query(cartCheckQuery, [userId, productId], async (err, cartResults) => {
      if (err) {
        console.error("Error checking cart:", err);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      if (cartResults.length > 0) {
        // Product is already in the cart, update the quantity
        const updateCartQuery = "UPDATE cart SET quantity = quantity + 1 WHERE userId = ? AND productId = ? AND status = 0";
        db.query(updateCartQuery, [userId, productId], (err, updateResults) => {
          if (err) {
            console.error("Error updating cart:", err);
            return res.status(500).json({ success: false, error: "Failed to update cart" });
          }
          return res.status(200).json({ success: true, message: "Cart updated successfully" });
        });
      } else {
        // Check if there's an accepted order for the product
        const acceptedOrderQuery = "SELECT * FROM cart WHERE userId = ? AND productId = ? AND status = 1 AND orderStatus IN (1, 2, 3, 4)";
        db.query(acceptedOrderQuery, [userId, productId], (err, orderResults) => {
          if (err) {
            console.error("Error checking accepted orders:", err);
            return res.status(500).json({ success: false, error: "Database error" });
          }

          if (orderResults.length > 0) {
            // Accepted order exists, insert a new row with status = 0
            const insertCartQuery = "INSERT INTO cart (userId, productId, status, orderStatus, quantity) VALUES (?, ?, 0, 0, 1)";
            db.query(insertCartQuery, [userId, productId], (err, insertResults) => {
              if (err) {
                console.error("Error inserting into cart:", err);
                return res.status(500).json({ success: false, error: "Failed to add item to cart" });
              }
              return res.status(201).json({ success: true, message: "Item added to cart successfully" });
            });
          } else {
            // No accepted order exists, insert a new row with initial values
            const insertCartQuery = "INSERT INTO cart (userId, productId, status, orderStatus, quantity) VALUES (?, ?, 0, 0, 1)";
            db.query(insertCartQuery, [userId, productId], (err, insertResults) => {
              if (err) {
                console.error("Error inserting into cart:", err);
                return res.status(500).json({ success: false, error: "Failed to add item to cart" });
              }
              return res.status(201).json({ success: true, message: "Item added to cart successfully" });
            });
          }
        });
      }
    });
  });
});



// Get cart items for customer
exports.getCartItems = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.userId;

  // SQL query to fetch cart items and associated product details for the logged-in user
  const sql = `
    SELECT 
      p.ProductId,
      p.ProductName,
      p.description,
      p.Price,
      p.CategoryName,
      p.Image,
      SUM(c.quantity) as totalQuantity
    FROM 
      cart c
    JOIN 
      products p 
    ON 
      c.ProductID = p.ProductId
    WHERE
      c.UserId = ? AND c.status=0
    GROUP BY
      p.ProductId, p.ProductName, p.description, p.Price, p.CategoryName, p.Image
  `;

  //executing thw sql query with the userId as a parameter
  db.query(sql, [userId], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    

    //for calculating total price of the cart products
    let totalPrice = 0;

    data.forEach((item)=>{
      totalPrice += item.Price* item.totalQuantity;
    })
    const deliveryPrice = 30;
    totalPrice += deliveryPrice
    //here inside json the object is sendig. not single parameters. it is sending as an objectx 
    res.status(200).json({data, totalPrice});
  });
});


//remove from cart

exports.removeFromCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.userId;
  const productId = req.params.productId;

  const cartCheckQuery = "SELECT * FROM cart WHERE userId = ? AND productId = ?";
  db.query(cartCheckQuery, [userId, productId], (err, cartResults) => {
    if (err) {
      console.error("Error checking cart:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    if (cartResults.length === 0) {
      return res.status(404).json({ success: false, error: "Item not found in cart" });
    }

    const deleteCartQuery = "DELETE FROM cart WHERE userId = ? AND productId = ?";
    db.query(deleteCartQuery, [userId, productId], (err, deleteResults) => {
      if (err) {
        console.error("Error deleting cart item:", err);
        return res.status(500).json({ success: false, error: "Failed to remove item from cart" });
      }
      return res.status(200).json({ success: true, message: "Item removed from cart successfully" });
    });
  });
});