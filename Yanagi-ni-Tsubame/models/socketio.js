var app = require("../app.js");
var sio = require("socket.io");
var go = require("./gameObject");
var session = require("express-session");
var setting = require("../setting");

var players = [];
var enemys = [];
var items = [];
function socketio (server) {
	var io = sio.listen(server);
	io.use(function (socket, next) {
		var cookieParser = require('cookie-parser');
		var parseCookie = cookieParser(setting.cookie.secret);
		parseCookie(socket.handshake, null, function(err) {
			if (err) {
				return accept('Error parseCookie.', false);
			}
			var sessionId = socket.handshake.signedCookies[setting.cookie.key];
			console.log("sessionId " + sessionId);
			next();
		});
	});

	// サーバー接続処理
	io.sockets.on('connection', function(socket) {
		console.dir(socket);
		var p = new go.Player(socket.id,0,0,"");
		players.push(p);
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