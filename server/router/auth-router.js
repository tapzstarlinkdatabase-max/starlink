const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  session,
} = require("../controllers/auth-controller.js");

router.post("/login", login);
router.post("/logout", logout);
router.get("/session", session);
router.use(require("../middlewares/error-middleware.js"));

module.exports = router;
