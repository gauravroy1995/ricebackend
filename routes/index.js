var express = require("express");
var router = express.Router();
let signup = require("../app/helpers/register");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/register", function(req, res, next) {
  signup.registerUser(req, res);
});
router.post("/checkIfCardValid", function(req, res, next) {
  signup.checkIfCardIsValid(req, res);
});

router.post("/addMoney", function(req, res, next) {
  signup.updateMoneyAmount(req, res);
});
router.post("/withdraw", function(req, res, next) {
  signup.subtractAmount(req, res);
});
module.exports = router;
