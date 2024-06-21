//const { uploadImage } = require("../controllers/ProductController");
const express = require("express");
const {
  // addProduct,
  getAllProducts,
  getProductDetails,
  deleteProduct,
  searchProducts,
  addProductWithImage,
  updateProduct
} = require("../controllers/ProductController");

const router = express.Router();

router.route("/products").get(getAllProducts);

//add product with image. New product will be added
router.route("/addProduct").post(addProductWithImage);

//product detailss
router
  .route("/products/:ProductId")
  .get(getProductDetails)
  .delete(deleteProduct)
  .put(updateProduct);
  // app.get("/api/products/search", exports.searchProducts);
  router.route("/searchproduct").get(searchProducts)


// router.route("/searchProducts").get(searchProducts);
//router.route("/upload").post()

// router.route("products/:ProductId").put(updateProduct)
// app.put('products/:ProductId', exports.updateProduct);

module.exports = router;
