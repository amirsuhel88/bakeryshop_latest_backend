const express = require("express");
const { addToAddress, updateAddress } = require("../controllers/AddressController");
const { authenticateToken } = require("../controllers/userController");
const router = express.Router();

router.route("/addToAddress").post(authenticateToken, addToAddress); //working
router.route("/updateAddress/:AddressId").put(authenticateToken, updateAddress);
module.exports = router;
