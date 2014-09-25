var sio = require('socket.io');
var go = require('./gameObject');
var database = require("./sqlite3");

var players = [];
var enemys = [];
var items = [];

function socketio (server) {
	var io = sio.listen(server);

	// サーバー接続処理
	io.sockets.on('connection', function (socket) {
		var p = new go.Player(socket.id, 0, 0, Math.random());
		players.push(p);
		console.log('connection\nplayer num : ' + players.length);

		// 初回データ送信
		socket.json.emit('first_message', { player: p, players: players, enemys: enemys, items: items });
		
		// 各クライアントのデータ受信
		socket.json.on('player_data', function (data) {
			var dp = data.player;
			for(var i = 0; i < players.length; i++) {
				if(players[i].id === dp.id) {
					//playerデータの更新
					players[i].x = dp.x;
					players[i].y = dp.y;
					players[i].hp = dp.hp;
					players[i].state = dp.state;
					break;
				}
			}

			// ダメージ処理
			data.atkEnemys.forEach(function(data) {
				for(var i = 0; i < enemys.length; i++) {
					if(enemys[i].id == data.id) {
						enemys[i].hp -= data.damage;
						break;
					}
				}
			});
		});

		// 切断処理
		socket.on('disconnect', function() {
			for(var i = 0; i < players.length; i++) {
				if(players[i].id === socket.id) {
					// database.run("update game set lastX = $x, lastY = $y where id = $id", { $x: players[i].x, $y: players[i].y, $id: players[i].id} );
					players.splice(i, 1);
					console.log('disconnection\nplayer num : ' + players.length);
					break;
				}
			}
		});
	});

	// 全プレイヤーデータ送信（毎秒60回）
	var timeCounter = 0;
	setInterval(function() {
		timeCounter++;

		//敵の更新、HPが0以下の敵を検索
		var deadEnemys = [];
		enemys.forEach(function(enemy) {
			enemy.update();
			if (enemy.hp <= 0) {
				deadEnemys.push(enemy);
			}
		});

		// 敵の削除
		deadEnemys.forEach(function(de) {
			enemys.splice(enemys.indexOf(de), 1);
		});

		//敵の生成
		if (timeCounter === 100　&& enemys.length < 50) {
			var _id = "" + Date.now() + Math.random();
			var _x = Math.floor((Math.random() * 10) - 5) * 100;
			var _y = Math.floor((Math.random() * 10) - 5) * 100;
			var enemy = new go.Enemy(_id, _x, _y, "test");
			enemys.push(enemy);
			timeCounter = 0;
		}

		io.sockets.json.emit('server_update', { players : players , enemys : enemys });
	}, 17);
}

module.exports = socketio;