var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.render("gameDev", { 
  		title: "ヤナギニツバメ",
  		isLogin: req.session.isLogin,
  		user: req.session.user
  	});
});

module.exports = router;
