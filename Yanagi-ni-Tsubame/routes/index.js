var express = require("express");
var YTDB = require("../models/sqlite3").YTDB;
var router = express.Router();

router.get("/", function (req, res) {
	YTDB.all("select playerName, score from game order by score desc", function (err,rows) {
		var rank = [];
		if(!err) {
			rank = rows;	
		} else {
			rank = [];
		}
		console.log(rank);
		res.render("index", {
			title: "ヤナギニツバメ",
			isLogin: req.session.isLogin,
			user: req.session.user,
			rank: rank
		});
	});
});


module.exports = router;
