const express = require("express");
const {
  getUsers,
  signUp,
  login,
  getProfile,
  authenticateToken,
} = require("../controllers/userController");

const router = express.Router();

router.route("/users").get(getUsers);
router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/profile").get(authenticateToken, getProfile);  //if authentication is succeed and user is found then getProfile will execute

module.exports = router;
