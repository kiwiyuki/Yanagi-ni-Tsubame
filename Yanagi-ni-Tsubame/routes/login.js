var express = require("express");
var router = express.Router();
var passport = require("../models/passport");

router.use(passport.initialize());
router.use(passport.session());

router.get("/twitter", passport.authenticate("twitter"));
router.get("/twitter/callback", passport.authenticate("twitter", {
	failuerRedirect: "/"
}), function (req, res) {
	res.redirect("index");
} );

router.get("/facebook", passport.authenticate("facebook"));
router.get("/facebook/callback", passport.authenticate("facebook", {
	failuerRedirect: "/"
}), function (req, res) {
	console.log(req);
	res.redirect("index");
});
module.exports = router;