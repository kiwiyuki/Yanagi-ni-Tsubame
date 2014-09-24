var app = require("../app.js");
var sio = require("socket.io");
var go = require("./gameObject");
// var session = require("express-session");
// var COOKIE_SECRET = "secret-session";
// var COOKIE_KEY    = "sid";
// var sessionStore = require("connect-sqlite3")(session);
// var sessionStore = app.sessionStore

var players = [];
var enemys = [];
var items = [];
function socketio (server) {
	var io = sio.listen(server);
	io.use(function (socket, next) {
		console.log(socket.request);
	// 	var cookieParser = require('cookie-parser');
	// 	var parseCookie = cookieParser(COOKIE_SECRET);
	// 	parseCookie(socket.handshake, null, function(err) {
	// 		if (err) {
	// 			return accept('Error parseCookie.', false);
	// 		}
	// 		var sessionId = socket.handshake.signedCookies[COOKIE_KEY];
	// 		console.log("sessionId " + sessionId);
	// 	});
	// 	var parseSignedCookie = connect.utils.parseSignedCookie;
	// 	var cookie = require("cookie-parser/node_modules/cookie").parse(socket.request.headers.cookie);
	// 	cookie = require('cookie-parser/lib/parse').signedCookies(cookie, COOKIE_SECRET);
	// 	var sessionID = parseSignedCookie(parseCookie(socket.handshake.headers.cookie)['connect.sid'], COOKIE_SECRET);
	// 	console.dir(socket.request);
	// 	sessionStore.get(sessionID, function (err, sessionData){
	// 		console.log("hoge");
		// });
	});

	// サーバー接続処理
	io.sockets.on('connection', function(socket) {
		var p = new go.Player(socket.id,0,0,"");
		players.push(p);
		console.log(socket);
		// 初回データ送信
		socket.json.emit('first_message', { player:p, players: players, enemys: enemys, items:items });
		
		// 各クライアントのデータ受信
		socket.json.on("client_data", function (data) {

		});

		// 切断処理
		socket.on("disconnect", function() {
			for(var i = 0; i < players.length; i++) {
				if(players.id === socket.id) {
					players.splice(i,1);
					break;
				}
			}
		});
	});

	// 全プレイヤーデータ送信（毎秒30回）
	// setInterval(function() {
	// 	io.sockets.json.emit('world_data', world_data);
	// }, 33);
}

module.exports = socketio;