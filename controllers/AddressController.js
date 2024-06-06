const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const salt = 10;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlinebakeryshop",
});

//Add new address
//Add address from user token

// Assuming you have defined `db` for database connection and `catchAsyncErrors` for error handling

// Function to add an address to the database
exports.addToAddress = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.userId; // Assuming you are extracting user ID from authenticated user
  const {
    Phone,
    Street,
    Address,
    City,
    Area,
    State,
    Country,
    PostalCode,
    Landmark,
    AlternatePhone,
  } = req.body;

  // Check if all required fields are present
  if (!Phone || !Street || !Address || !City || !Country || !PostalCode) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  // Construct SQL query to insert address into database
  const insertSql = `
      INSERT INTO address 
        (UserId, Phone, Street, Address, City, Area, State, Country, PostalCode, Landmark, AlternatePhone)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    userId,
    Phone,
    Street,
    Address,
    City,
    Area,
    State,
    Country,
    PostalCode,
    Landmark,
    AlternatePhone,
  ];

  // Execute the query to insert address into database
  db.query(insertSql, values, (err, result) => {
    if (err) {
      console.error("Error inserting address:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to add address" });
    }

    // Address successfully added to database
    return res
      .status(201)
      .json({ success: true, message: "Address added successfully" });
  });
});

//Update Existing address

exports.updateAddress = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.userId; // extracting user ID from authenticated user
  const addressId = req.params.AddressId; // addressId is passed as a route parameter
  console.log(userId,'address: '+ addressId);
  const {
    Phone,
    Street,
    Address,
    City,
    Area,
    State,
    Country,
    PostalCode,
    Landmark,
    AlternatePhone,
  } = req.body;

  // Check if all required fields are present
  if (!Phone || !Street || !Address || !City || !Country || !PostalCode) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  // Construct SQL query to update address in the database
  const updateSql = `
    UPDATE address
    SET
      Phone = ?,
      Street = ?,
      Address = ?,
      City = ?,
      Area = ?,
      State = ?,
      Country = ?,
      PostalCode = ?,
      Landmark = ?,
      AlternatePhone = ?
    WHERE UserId = ? AND AddressId = ?
  `;

  const values = [
    Phone,
    Street,
    Address,
    City,
    Area,
    State,
    Country,
    PostalCode,
    Landmark,
    AlternatePhone,
    userId,
    addressId,
  ];

  // Execute the query to update the address in the database
  db.query(updateSql, values, (err, result) => {
    if (err) {
      console.error("Error updating address:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to update address" });
    }

    // Check if any rows were affected by the update operation
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Address not found for the user" });
    }

    // Address successfully updated in the database
    return res
      .status(200)
      .json({ success: true, message: "Address updated successfully" });
  });
});
