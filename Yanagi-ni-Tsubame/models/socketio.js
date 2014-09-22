var sio = require('socket.io');
var go = require('./gameObject');
var session = require('express-session').Session;
var COOKIE_SECRET = 'secret-session';
var COOKIE_KEY    = 'sid';

var players = [];
var enemys = [];
var items = [];

function socketio (server) {
	var io = sio.listen(server);

	// io.use(function (socket, next) {
	// 	var cookie = require('cookie').parse(socket.request.headers.cookie);
	// 	cookie = require('cookie-parser/lib/parse').signedCookies(cookie, COOKIE_SECRET);
	// 	var sessionID = cookie[COOKIE_KEY];
	// 	console.log(sessionID);
	// });

	// サーバー接続処理
	io.sockets.on('connection', function (socket) {
		var p = new go.Player(socket.id, 0, 0, '');
		players.push(p);

		// 初回データ送信
		socket.json.emit('first_message', { player: p, players: players, enemys: enemys, items: items });
		
		// 各クライアントのデータ受信
		socket.json.on('client_data', function (data) {

		});

		// 切断処理
		socket.on('disconnect', function() {
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