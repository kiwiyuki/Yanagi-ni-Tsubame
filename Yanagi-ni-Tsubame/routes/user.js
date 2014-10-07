var express = require("express");
var YTDB = require("../models/sqlite3").YTDB;
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

router.post("/", ensureAuthenticated, function (req, res) {
	req.session.user.game.color = req.body.color - 0;
	YTDB.run("update game set color = $co where id = $id" , {
		$co: req.session.user.game.color,
		$id: req.session.user.id
	});
	res.render("user", {
		title: "ヤナギニツバメ ユーザーページ",
		isLogin: req.session.isLogin,
		user: req.session.user
	});
});
module.exports = router;
