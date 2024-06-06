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

//get all user info

exports.getUsers = catchAsyncErrors(async (req, res, next) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) {
      return res.json("Error");
    }
    return res.json(data);
  });
});

//signup/ register

exports.signUp = catchAsyncErrors(async (req, res, next) => {
  const saltRounds = 10;
  const sql =
    "INSERT INTO users(`name`, `email`, `phone`, `password`) VALUES (?, ?, ?, ?)";
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    const values = [req.body.name, req.body.email, req.body.phone, hash];

    db.query(sql, values, (err, data) => {
      console.log(err);
      if (err) {
        return res.json("signup custom Error by me", err);
      }
      return res.json("Signup successful");
    });
  });
});

//login

exports.login = catchAsyncErrors(async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email && password) {
    const sql = "SELECT * FROM users WHERE `email` =?";
    db.query(sql, [email], async (err, data) => {
      if (err) {
        return res.json("login custom Error by me");
      }

      if (data.length > 0) {
        const user = data[0];
        
        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          // Passwords match, create token
          const token = jwt.sign({ userId: user.id }, "sdsdsdsdsdsdsdsd", {
            expiresIn: "1h",
          });
          
          let isAdmin = false
          isAdmin = user.role == 1;
          // Send the token in response
          return res.json({ success: true, isAdmin, token: token });
        } else {
          return res.json({ success: false, message: "Incorrect password, backend" });
        }
      } else {
        return res.json({ success: false, message: "User not found" });
      }
    });
  } else {
    res.json({ success: false, message: "Email and password are required" });
  }
});

//get user profile

exports.getProfile = catchAsyncErrors(async (req, res, next) => {
  //console.log(req.user);
  const userId = req.user.userId;
  const sql = "SELECT * FROM users WHERE `id`=? ";
  db.query(sql, [userId], (err, [data]) => {
    if (err) {
      return res.json("Error");
    }
    return res.json(data);
  });
});

//user authentication

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; //
  const token = authHeader && authHeader.split(" ")[1]; //Bearer token,
  if (!token) {
    return res.status(401).json("Un-authorized");
  }
  jwt.verify(token, "sdsdsdsdsdsdsdsd", (error, user) => {
    if (error) {
      return res.status(403).json("forbidden");
    }
    req.user = user;
    next();
  });
};
