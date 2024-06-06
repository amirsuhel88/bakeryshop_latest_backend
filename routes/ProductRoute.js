//const { uploadImage } = require("../controllers/ProductController");
const express = require("express");
const {
  // addProduct,
  getAllProducts,
  getProductDetails,
  deleteProduct,
  searchProducts,
  addProductWithImage,
} = require("../controllers/ProductController");

const router = express.Router();

router.route("/products").get(getAllProducts);

//add product with image. New product will be added
router.route("/addProduct").post(addProductWithImage);

//product detailss
router
  .route("/products/:ProductId")
  .get(getProductDetails)
  .delete(deleteProduct);
router.route("/searchProducts").get(searchProducts);
//router.route("/upload").post()

module.exports = router;
