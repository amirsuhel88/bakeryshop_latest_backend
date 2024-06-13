const express = require("express");
const { addToAddress, updateAddress, viewAddresses } = require("../controllers/AddressController");
const { authenticateToken } = require("../controllers/userController");
const router = express.Router();

router.route("/addToAddress").post(authenticateToken, addToAddress); //working
router.route("/updateAddress/:AddressId").put(authenticateToken, updateAddress);
router.route("/user/viewaddresses").get(authenticateToken, viewAddresses);
module.exports = router;
