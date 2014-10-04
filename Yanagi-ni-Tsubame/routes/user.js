var express = require("express");
var router = express.Router();

ensureAuthenticated = function (req, res, next) {
	if(!req.session.user) {
		res.redirect("login");
	} else {
		next();
	}
};

router.get("/", ensureAuthenticated, function (req, res) {
	res.render("user", {
		title: "ヤナギニツバメ ユーザーページ",
		isLogin: req.session.isLogin,
		user: req.session.user
	});
});


module.exports = router;
