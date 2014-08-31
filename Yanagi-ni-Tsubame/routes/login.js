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
	res.redirect("/");
} );

router.get("/facebook", passport.authenticate("facebook"));
router.get("/facebook/callback", passport.authenticate("facebook", {
	// successRedirect: '/',
	failuerRedirect: "/login"
}), function (req, res) {
	// console.log(req);
	res.redirect("/");
});
module.exports = router;