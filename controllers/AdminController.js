const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cors = require("cors");
const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Setup CORS
router.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlinebakeryshop",
});

// Upload image
router.post(
  "/upload",
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Assuming the file path needs to be saved to the database
    const imagePath = `/public/images/${req.file.filename}`;
    const userId = req.user.userId; // Retrieve user ID from the request (assumed to be set by authentication middleware)

    // Insert the file path into the database
    const insertSql = "INSERT INTO images (userId, imagePath) VALUES (?, ?)";
    db.query(insertSql, [userId, imagePath], (err, results) => {
      if (err) {
        console.error("Error saving image path to database:", err);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      res.status(201).json({ success: true, message: "Image uploaded successfully", imagePath: imagePath });
    });
  })
);

module.exports = router;
