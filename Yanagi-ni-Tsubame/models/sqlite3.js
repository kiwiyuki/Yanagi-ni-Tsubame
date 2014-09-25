var sqlite3 = require("sqlite3").verbose();
var setting = require("../setting");
var database = new sqlite3.Database(setting.database.path);

database.run("create table if not exists users (id, username, displayName, photos, created)");
database.run("create table if not exists game (id, score, color)");

module.exports = database;