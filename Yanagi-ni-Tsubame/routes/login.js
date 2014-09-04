var express = require("express");
var router = express.Router();
var passport = require("../models/passport");

router.use(passport.initialize());
router.use(passport.session());

router.get("/", function (req, res) {
	res.render("login");
});
router.get("/twitter", passport.authenticate("twitter"));
router.get("/twitter/callback", passport.authenticate("twitter", {
	failuerRedirect: "/login"
}), function (req, res) {
	req.session.isLogin = true;
	req.session.user = {
		id: req.session.passport.user.id,
		username: req.session.passport.user.username,
		displayName: req.session.passport.user.displayName,
		photo: req.session.passport.user.photos[0].value,
		provider:req.session.passport.user.provider
	};
	res.redirect("/");
} );

router.get("/facebook", passport.authenticate("facebook"));
router.get("/facebook/callback", passport.authenticate("facebook", {
	failuerRedirect: "/login"
}), function (req, res) {
	req.session.isLogin = true;
	req.session.user = {
		id: req.session.passport.user.id,
		username: req.session.passport.user.username,
		displayName: req.session.passport.user.displayName,
		photo: req.session.passport.user.photos[0].value,
		provider:req.session.passport.user.provider
	};
	res.redirect("/");
});
module.exports = router;