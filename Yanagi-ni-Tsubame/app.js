var express = require("express");
var path = require("path");
var favicon = require("static-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var sessionStore = require("connect-sqlite3")(session);

var passport = require("./models/passport");

var routes = require("./routes/index");
var users = require("./routes/users");
var login = require("./routes/login");
var logout = require("./routes/logout");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(favicon());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    cookie: {
        httpOnly: false,
        maxAge: 60*60*24
    },
    secret: "secret-session", //TODO ランダムな文字列に変える必要あり？
    store: new sessionStore
}));

app.use("/", routes);
app.use("/users", users);
app.use("/login",login);
app.use("/logout",logout);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {}
    });
});


module.exports = app;
