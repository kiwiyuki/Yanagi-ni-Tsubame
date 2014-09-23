var sio = require('socket.io');
var go = require('./gameObject');

var players = [];
var enemys = [];
var items = [];

function socketio (server) {
	var io = sio.listen(server);

	// サーバー接続処理
	io.sockets.on('connection', function (socket) {
		var p = new go.Player(socket.id, 0, 0, Math.random());
		players.push(p);
		console.log('connection \n player num : ' + players.length);

		// 初回データ送信
		socket.json.emit('first_message', { player: p, players: players, enemys: enemys, items: items });
		
		// 各クライアントのデータ受信
		socket.json.on('client_data', function (data) {

		});

		// 切断処理
		socket.on('disconnect', function() {
			for(var i = 0; i < players.length; i++) {
				if(players[i].id === socket.id) {
					players.splice(i, 1);
					console.log('disconnection \n player num : ' + players.length);
					break;
				}
			}
		});
	});

	// 全プレイヤーデータ送信（毎秒30回）
	setInterval(function() {
		io.sockets.json.emit('server_update', { players : players });
	}, 33);
}

module.exports = socketio;