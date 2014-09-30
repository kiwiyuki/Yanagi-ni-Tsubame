var app = require("../app.js");
var sio = require("socket.io");
var go = require("./gameObject");
var session = require("express-session");
var setting = require("../setting");
var YTDB = require("./sqlite3").YTDB;
var sessionDB = require("./sqlite3").sessionDB;

var players = [];
var enemys = [];
var items = [];
var loopInterval;

function socketio (server) {
	var io = sio.listen(server);

	// クッキー処理
	io.use(function (socket, next) {
		var cookieParser = require("cookie-parser");
		var parseCookie = cookieParser(setting.cookie.secret);
		parseCookie(socket.handshake, null, function (err) {
			if (!err) {
				var sessionId = socket.handshake.signedCookies[setting.cookie.key];
				socket.sessionId = sessionId;
				next();
			}
		});
	});

	// サーバー接続処理
	io.sockets.on('connection', function (socket) {
		// データーベース処理
		var p;
		sessionDB.all("select sess from sessions where sid = $sid", { $sid: socket.sessionId }, function (err, rows) {
			if(!err) {
				var user;
				
				// クッキーの検索
				if(rows[0] !== undefined && rows[0].sess !== undefined) {
					var pC = JSON.parse(rows[0].sess);
					user = pC.user;
				}

				if(user) {
					console.log("hello " + user.displayName + " , id :" + user.id);
				} else {
					user = {};
					user.game = {};
					console.log("no login user socketId :" + socket.id);
					user.id = socket.id;
					user.game.lastX = 0;
					user.game.lastY = 0;
					user.game.lastHP = 300;
					user.game.score = 0;
					user.game.color = Math.random();
				}

				console.log(user);
				p = new go.Player(user.id, user.game.lastX, user.game.lastY, user.game.lastHP, user.game.score,user.game.color);
				players.push(p);

				// 初回データ送信
				socket.json.emit('first_message', { player: p, players: players, enemys: enemys, items: items });
				console.log('connection\nplayer num : ' + players.length);
				
				if(players.length == 1) {
					console.log("start main loop");
					loopInterval = setInterval(loop,　17);
				}

			} else {
				console.dir(err);
			}
		});

		// 各クライアントのデータ受信
		socket.json.on('player_data', function (data) {
			var dp = data.player;
			var pIndex = 0;
			for(var i = 0; i < players.length; i++) {
				if(players[i].id == dp.id) {
					pIndex = i;
					//playerデータの更新
					players[i].x = dp.x;
					players[i].y = dp.y;
					players[i].hp = dp.hp;
					players[i].state = dp.state;
					break;
				}
			}

			// ダメージ処理
			data.atkEnemys.forEach(function(ae) {
				for(var i = 0; i < enemys.length; i++) {
					if(enemys[i].id == ae.id) {
						enemys[i].hp -= ae.damage;

						// スコア追加
						if (enemys[i].hp <= 0) {
							players[pIndex].score += enemys[i].point;
							
							// アイテムの生成
							var itemNum = enemys[i].itemNum ? enemys[i].itemNum : 0;
							var j = 0;
							while(j < itemNum) {
								var _x = enemys[i].x;
								var _y = enemys[i].y;
								var item = new go.Item(_x, _y, enemys[i].itemType);
								items.push(item);
								j++;
							}
						}
						break;
					}
				}
			});

			// アイテム取得処理
			data.getItems.forEach(function(gi) {
				for(var i = 0; i < items.length; i++) {
					if(items[i].id == gi.id) {
						players[pIndex].score += items[i].point;
						items.splice(i, 1);
						break;
					}
				}
			});
		});

		// 切断処理
		socket.on('disconnect', function() {
			for(var i = 0; i < players.length; i++) {
				if(players[i].id === p.id) {
					console.log("saved!");
					YTDB.run("update game set lastX = $x, lastY = $y, lastHP = $hp, score = $sc where id = $id", { $x: players[i].x, $y: players[i].y, $hp: players[i].hp, $sc : players[i].score, $id: players[i].id} );
					players.splice(i, 1);
					console.log('disconnection\nplayer num : ' + players.length);
					break;
				}
			}
		});
	});

	// 全プレイヤーデータ送信（毎秒60回）
	var timeCounter = 0;
	var loop = function() {
		if(players.length === 0) {
			console.log("stop loop");
			clearInterval(loopInterval);
		}

		timeCounter++;

		// 敵の更新、HPが0以下の敵を検索
		var deadEnemys = [];
		enemys.forEach(function(enemy) {
			enemy.update();

			if (enemy.hp <= 0) {
				deadEnemys.push(enemy);
			}
		});

		// 敵の削除
		deadEnemys.forEach(function(de) {
			var deIndex = enemys.indexOf(de);
			enemys.splice(deIndex, 1);
		});

		// 敵の生成
		if (timeCounter == 100　&& enemys.length < 50) {
			var _x = Math.floor((Math.random() * 10) - 5) * 100;
			var _y = Math.floor((Math.random() * 10) - 5) * 100;
			var enemy = new go.Enemy(_x, _y, "test");
			enemys.push(enemy);
			timeCounter = 0;
		}

		io.sockets.json.emit('server_update', { players : players , enemys : enemys , items : items});
	};
}

module.exports = socketio;