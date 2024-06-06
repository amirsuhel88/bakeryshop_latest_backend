const multer = require("multer");
const path = require("path");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const mysql = require("mysql");
const fs = require("fs");

//database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlinebakeryshop",
});

//image directory check. If not available it will create the directiory
const uploadDir = path.join(__dirname, "public", "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  // limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mimetype
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}

// Controller function for image upload
exports.uploadImage = catchAsyncErrors(async (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ success: false, error: err });
    } else {
      if (!req.file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
      } else {
        // res.status(200).json({ success: true, data: req.file });

        // Save the file path to MySQL database
        const imagePath = "/public/images/" + req.file.filename; // Assuming the images are served from a 'public' directory
        const sql = "INSERT INTO products(image) VALUES (?)";
        db.query(sql, [imagePath], (err, result) => {
          if (err) {
            res.status(500).json({ success: false, error: err });
          } else {
            res.status(200).json({ success: true, imagePath: imagePath });
          }
        });
      }
    }
  });
});
