var passport = require("passport");
var TwitterStrategy = require("passport-twitter").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var setting = require("../setting.js");

passport.use(new TwitterStrategy({
	consumerKey: setting.twitter.consumerKey,
	consumerSecret: setting.twitter.consumerSecret,
	callbackURL: setting.twitter.callbackURL
},function (token, tokenSecret, profile, done) {
	done(null, profile);
}));

passport.use(new FacebookStrategy({
	clientID: setting.facebook.clientID,
	clientSecret: setting.facebook.clientSecret,
	callbackURL: setting.facebook.callbackURL,
	enableProof: false
	// profileFields: ['id', 'displayName', 'photos']
},function (accessToken, refreshToken, profile, done) {
	done(null, profile);
}));

passport.serializeUser(function (user, done) {
	done(null, user);
});
passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

module.exports = passport;