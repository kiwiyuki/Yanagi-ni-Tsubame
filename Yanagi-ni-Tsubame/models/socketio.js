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
		socket.json.on('player_data', function (data) {
			for(var i = 0; i < players.length; i++) {
				if(players[i].id === data.id) {
					//playerデータの更新
					players[i].x = data.x;
					players[i].y = data.y;
					players[i].hp = data.hp;
					players[i].state = data.state;
					break;
				}
			}
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
	var time_conuter = 0;
	setInterval(function() {
		time_conuter++;
		//敵の更新
		for(var i = 0; i < enemys.length; i++) {
			enemys[i].counter++;
		}

		//敵の生成
		if (time_conuter === 100　&& enemys.length < 100) {
			var _id = Date.now() + Math.random();
			var _x = Math.floor((Math.random() * 10) - 5) * 100;
			var _y = Math.floor((Math.random() * 10) - 5) * 100;
			var enemy = new go.Enemy(_id, _x, _y, "test");
			enemys.push(enemy);
			time_conuter = 0;
		}

		if(enemys.length > 0 && enemys[0].counter > 500) {
			enemys.shift();
		}
		
		io.sockets.json.emit('server_update', { players : players , enemys : enemys });
	}, 33);
}

module.exports = socketio;