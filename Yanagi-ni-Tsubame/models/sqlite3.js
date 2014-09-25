var sqlite3 = require("sqlite3").verbose();
var setting = require("../setting");
var usersDB = new sqlite3.Database(setting.database.users.path);
var gameDB = new sqlite3.Database(setting.database.game.path);
var sessionDB = new sqlite3.Database(setting.session.path);

usersDB.run("create table if not exists users (id, username, displayName, photos, provider, created)");
gameDB.run("create table if not exists game (id, lastX, lastY, score, color)");

module.exports = {
	usersDB: usersDB,
	gameDB: gameDB,
	sessionDB: sessionDB
};