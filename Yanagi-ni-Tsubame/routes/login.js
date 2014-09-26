var express = require("express");
var router = express.Router();
var passport = require("../models/passport");
var sqlite3 = require("../models/sqlite3");
var usersDB = sqlite3.usersDB;
var gameDB = sqlite3.gameDB;


router.use(passport.initialize());
router.use(passport.session());

router.get("/", function (req, res) {
	res.render("login", {
		title: "ヤナギニツバメ ログイン",
		isLogin: req.session.isLogin,
		user: req.session.user
	});
});
router.get("/twitter", passport.authenticate("twitter"));
router.get("/twitter/callback", passport.authenticate("twitter", {
	failuerRedirect: "/login"
}), loginCallback);

router.get("/facebook", passport.authenticate("facebook"));
router.get("/facebook/callback", passport.authenticate("facebook", {
	failuerRedirect: "/login"
}), loginCallback);

function loginCallback (req, res) {
	req.session.isLogin = true;
	req.session.user = {
		id: req.session.passport.user.id,
		username: req.session.passport.user.username,
		displayName: req.session.passport.user.displayName,
		photo: req.session.passport.user.photos[0].value,
		provider:req.session.passport.user.provider,
		created: Date()
	};
	usersDB.all("select id, provider from users where id = $id and provider = $pr", { $id: req.session.user.id, $pr: req.session.user.provider }, function (err, rows) {
		if(!err) {
			//新規
			if(rows.length === 0) {
				usersDB.run("insert into users (id, username, displayName, photos, provider, created) values ($id, $un, $dN, $ph, $pr, $cr)",{
					$id: req.session.user.id,
					$un: req.session.user.username,
					$dN: req.session.user.displayName,
					$ph: req.session.user.photo,
					$pr: req.session.user.provider,
					$cr: req.session.user.created
				});
				gameDB.run("insert into game (id, lastX, lastY, score, color) values ($id, 0, 0, 0, $co)", { $id: req.session.user.id, $co: Math.random() });
			//2回目以降、更新
			} else if(rows.length === 1) {
				usersDB.run("update users set username = $un, displayName = $dN, photos = $ph where id = $id and provider = $pr", {
					$id: rows[0].id,
					$un: req.session.user.username,
					$dN: req.session.user.displayName,
					$ph: req.session.user.photo,
					$pr: rows[0].provider
				});
			//エラー
			} else {

			}
		}
	});

	res.redirect("/");
}

module.exports = router;