var sqlite3 = require("sqlite3").verbose();
var setting = require("../setting");
var YTDB = new sqlite3.Database(setting.database.path);
var sessionDB = new sqlite3.Database(setting.session.path);

YTDB.run("create table if not exists users (id, username, displayName, photos, provider, created)");
YTDB.run("create table if not exists game (id, playerName, lastX, lastY, lastHP, score, color)");

module.exports = {
	YTDB: YTDB,
	sessionDB: sessionDB
};