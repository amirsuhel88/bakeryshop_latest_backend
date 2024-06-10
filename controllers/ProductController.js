const mysql = require("mysql");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { escape } = require("mysql");
const fuzzyset = require("fuzzyset");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
app.use(express.static("public"));
app.use('/public', express.static(path.join(__dirname, 'public')));
//database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlinebakeryshop",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage }).single("image");

//add a product

exports.addProductWithImage = catchAsyncErrors(async (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    //const imagePath = "/public/images/" + req.file.filename; // Assuming the images are served from a 'public' directory
    const imagePath = "" + req.file.filename; // Assuming the images are served from a 'public' directory

    const sql =
      "INSERT INTO products(`ProductName`, `Description`, `Price`, `StockQuantity`, `CategoryName`, `image`) VALUES (?,?,?,?,?,?)";
    const values = [
      req.body.ProductName,
      req.body.Description,
      req.body.Price,
      req.body.StockQuantity,
      req.body.CategoryName,
      imagePath,
    ];

    db.query(sql, values, (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, error: "Product add error" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Product added successfully", data });
    });
  });
});

//get All products

//with pagination

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  // Define pagination parameters
  const page = parseInt(req.query.page) || 1; // Current page, default is 1
  const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10
  const offset = (page - 1) * limit; // Offset calculation

  // SQL query with pagination
  const sql = `SELECT * FROM products LIMIT ${limit} OFFSET ${offset}`;

  db.query(sql, (err, data) => {
    if (err) {
      return res.json("Error");
    }
    return res.json(data);
  });
});

/*

// Get All products with optional price and category filter
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, limit = 10, minPrice, maxPrice, category } = req.query;

  let sql = "SELECT * FROM products";

  const params = [];
  let conditions = [];

  // Build conditions for filtering
  if (minPrice !== undefined && !isNaN(minPrice)) {
    conditions.push(`Price >= ?`);
    params.push(parseFloat(minPrice));
  }
  
  if (maxPrice !== undefined && !isNaN(maxPrice)) {
    conditions.push(`Price <= ?`);
    params.push(parseFloat(maxPrice));
  }

  if (category) {
    conditions.push(`CategoryName = ?`);
    params.push(category);
  }

  // Append WHERE clause if conditions are provided
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Pagination
  sql += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(sql, params, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.json(data);
  });
});
*/

//get product details individually

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const sql = "SELECT * FROM products WHERE ProductId=?";
  db.query(sql, req.params.ProductId, (err, data) => {
    if (err) {
      return res.json("can't get product");
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(data[0]);
  });
});

//delete a product

// if a product is in cart table then it is not deleting

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const ProductId = req.params.ProductId; // Assuming productId is passed in the URL params

  const sql = "DELETE FROM products WHERE ProductId = ?";
  const values = [ProductId];

  db.query(sql, values, (err, data) => {
    console.log(err);
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).json({ error: "Product deletion failed" });
    }

    if (data.affectedRows === 0) {
      // If no rows were affected, product with given ProductId doesn't exist
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({ message: "Product deleted successfully" });
  });
});

//search a product
// Search products based on criteria (ProductName and CategoryName)
exports.searchProducts = catchAsyncErrors(async (req, res, next) => {
  const { keyword, category } = req.query;
  // Build the base SQL query
  let sql = "SELECT * FROM products WHERE 1 = 1"; // Using '1 = 1' to always start with a valid WHERE clause

  // Prepare WHERE clause based on search parameters
  const conditions = [];
  const values = [];
  if (keyword) {
    // Search by ProductName or Description using fuzzy matching
    const fuzzy = fuzzyset(Object.values(keyword));
    const similarProducts = fuzzy.get(keyword, null, 0.9); // Adjust similarity threshold as needed
    console.log(keyword);
    if (similarProducts && similarProducts.length > 0) {
      const similarKeywords = similarProducts.map((item) => item[1]);
      console.log("item: " + item);
      conditions.push(`(ProductName IN (?) OR Description IN (?))`);
      values.push(similarKeywords, similarKeywords);
    }
  }

  if (category) {
    conditions.push(`CategoryName = ?`);
    values.push(category);
  }

  // Concatenate conditions to the base SQL query
  if (conditions.length > 0) {
    sql += ` AND ${conditions.join(" AND ")}`;
  }

  // Execute the SQL query with prepared values
  db.query(sql, values, (err, data) => {
    if (err) {
      console.error("Error searching products:", err);
      return res.status(500).json({ error: "Product search failed" });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: "No matching products found" });
    }
    console.log(data);
    return res.json(data);
  });
});

//filter
// Middleware function for filtering products
const filterProducts = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM products`;

  const filters = [];
  const values = [];

  // Check if CategoryName filter is provided
  if (req.query.category) {
    filters.push(`CategoryName = ?`);
    values.push(req.query.category);
  }

  // Check if Price filter is provided
  if (req.query.minPrice && req.query.maxPrice) {
    filters.push(`Price BETWEEN ? AND ?`);
    values.push(parseFloat(req.query.minPrice));
    values.push(parseFloat(req.query.maxPrice));
  } else if (req.query.minPrice) {
    filters.push(`Price >= ?`);
    values.push(parseFloat(req.query.minPrice));
  } else if (req.query.maxPrice) {
    filters.push(`Price <= ?`);
    values.push(parseFloat(req.query.maxPrice));
  }

  if (filters.length > 0) {
    sql += ` WHERE ${filters.join(" AND ")}`;
  }

  sql += ` LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.json(data);
  });
});

//add product ===>>>for admin only
