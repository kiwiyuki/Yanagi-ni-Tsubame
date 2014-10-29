var express = require("express");
var router = express.Router();
var passport = require("../models/passport");
var YTDB = require("../models/sqlite3").YTDB;


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
	failuerRedirect: "/"
}), loginCallback);

router.get("/facebook", passport.authenticate("facebook"));
router.get("/facebook/callback", passport.authenticate("facebook", {
	failuerRedirect: "/"
}), loginCallback);

function loginCallback (req, res) {
	req.session.isLogin = true;
	req.session.user = {
		id: req.session.passport.user.id,
		username: req.session.passport.user.username,
		displayName: req.session.passport.user.displayName,
		photo: req.session.passport.user.photos[0].value,
		provider:req.session.passport.user.provider,
		created: Date(),
	};
	delete req.session.passport;
	YTDB.all("select id, provider from users where id = $id and provider = $pr", { $id: req.session.user.id, $pr: req.session.user.provider }, function (err, rows) {
		if(!err) {
			//新規
			if(rows.length === 0) {
				var co = Math.random() * (100 | 0) / 100;
				console.log("account init");
				req.session.user.game = {
					lastX : 0,
					lastY : 0,
					lastHP: 300,
					score : 0,
					color : co
				};
				YTDB.parallelize(function () {
					YTDB.run("insert into users (id, username, displayName, photos, provider, created) values ($id, $un, $dN, $ph, $pr, $cr)",{
						$id: req.session.user.id,
						$un: req.session.user.username,
						$dN: req.session.user.displayName,
						$ph: req.session.user.photo,
						$pr: req.session.user.provider,
						$cr: req.session.user.created,
					});
					var pn = (req.session.user.provider === "twitter") ? req.session.user.username : req.session.user.displayName;
					YTDB.run("insert into game (id, playerName, lastX, lastY, lastHP, score, color) values ($id, $pn, 0, 0, 300, 0, $co)", { $id: req.session.user.id, $pn: pn, $co: co });
				});
				res.redirect("/");
			//2回目以降、更新
			} else if(rows.length === 1) {
				console.log("login!");
				YTDB.parallelize(function () {
					YTDB.run("update users set username = $un, displayName = $dN, photos = $ph where id = $id and provider = $pr", {
						$id: rows[0].id,
						$un: req.session.user.username,
						$dN: req.session.user.displayName,
						$ph: req.session.user.photo,
						$pr: rows[0].provider
					});
					YTDB.all("select lastX, lastY, lastHP, score, color from game where id = $id", { $id: rows[0].id }, function (e, r){
						if(!e) {
							req.session.user.game = r[0];
						}
						res.redirect("/");
					});
				});
			//エラー
			} else {

			}
		
		}
	});
}

module.exports = router;