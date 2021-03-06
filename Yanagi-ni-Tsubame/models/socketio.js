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

var enemyGenerator = new EnemyGenerator(players, enemys);

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
					user.game.color = (Math.random() * 100 | 0) / 100;
				}

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
					players[i].bullets = dp.bullets;
					break;
				}
			}


			// ダメージ処理
			data.atkEnemys.forEach(function(ae) {
				for(var i = 0; i < enemys.length; i++) {
					if(enemys[i].id == ae.id) {
						if(ae.bt == "y") {
							enemys[i].hp -= 20;
						}

						// スコア追加（敵のHPが有り得ない数値のときはスコアとアイテムの追加なし）
						if (enemys[i].hp <= 0 && enemys[i].hp > -1000) {
							players[pIndex].score += enemys[i].point;
							
							// アイテムの生成
							var itemNum = enemys[i].itemNum ? enemys[i].itemNum : 0;
							var j = 0;
							var diff = Math.random() * 360 / Math.PI;
							while(j < itemNum) {
								var _x = enemys[i].x | 0;
								var _y = enemys[i].y | 0;
								var angle = 2 * Math.PI * j / ( itemNum ) + diff;
								var _vx = Math.sin(angle) * 3;
								var _vy = Math.cos(angle) * 3;
								var item = new go.Item(_x, _y, _vx, _vy, enemys[i].itemType);
								items.push(item);
								j++;
							}
							enemys[i].hp = -1500;
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

			// プレイヤー死亡処理
			if(dp.hp <= 0 && dp.state !== "WAIT") {
				var _p = players[pIndex];
				p = new go.Player(_p.id, _p.x, _p.y, 300, (_p.score / 2 + 0.5) | 0, _p.color);
				players.splice(pIndex, 1);
				players.push(p);
				socket.json.emit("dead_message", p);
			}
		});

		// 切断処理
		socket.on('disconnect', function() {
			for(var i = 0; i < players.length; i++) {
				if(players[i].id === p.id) {
					YTDB.run("update game set lastX = $x, lastY = $y, lastHP = $hp, score = $sc where id = $id", { $x: players[i].x, $y: players[i].y, $hp: players[i].hp, $sc : players[i].score, $id: players[i].id} );
					players.splice(i, 1);
					console.log('disconnection\nplayer num : ' + players.length);
					break;
				}
			}
		});
	});

	// 全プレイヤーデータ送信（毎秒60回）
	var loop = function() {
		if(players.length === 0) {
			console.log("stop loop");
			clearInterval(loopInterval);
		}

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
		enemyGenerator.update();

		// アイテムの状態更新
		var deadItems = [];
		items.forEach(function(item) {
			item.update();

			if (item.counter > 1200) {
				deadItems.push(item);
			}
		});

		// アイテムの削除
		deadItems.forEach(function(di) {
			var diIndex = items.indexOf(di);
			items.splice(di, 1);
		});
		
		io.sockets.volatile.json.emit('server_update', { players : players , enemys : enemys , items : items });
	};
}


function EnemyGenerator(players, enemys) {
	var counter = 0;
	
	this.update = function() {
		switch(counter) {
			case 100:
			fireworks("akatan", 5, 1);
			break;

			case 200:
			fireworks("akatan", 5,1.5);
			fireworks("aotan", 3,1);
			break;

			case 250:
			fireworks("aotan", 3,1);
			break;

			case 300:
			fireworks("akatan", 5,1);
			break;

			case 350:
			stalker("syobu" ,1);
			fireworks("akatan", 5,1);
			break;
		}
		counter++;

		// 1分で生成タイミングをループ
		if(counter > 360) {
			counter = 0;
		}
	};

	function generateTest(enemyType) {
		var test = new go.Enemy(0, 50, enemyType);
		
		test.individualUpdate = function(self) {
			self.y += 3;
		};

		enemys.push(test);
	}

	// あるプレイヤーに集中攻撃
	function fireworks(enemyType, enemyNum, radPer) {
		var playersLength = players.length;

		// 誰もいないときはスルー
		if(playersLength > 0) {
			var pIndex = Math.random() * playersLength | 0;
			var angle = Math.PI * 2 / enemyNum;
			var angleDiff = Math.random() * (180 / Math.PI);

			var targetPositionX = 0;
			var targetPositionY = 0;

			var maxX = 1100; // targetPositionXの最大値


			// 標的がアクティブでないときランダムにポジションをセット
			if(players[pIndex].state != "WAIT") {
				targetPositionX = players[pIndex].x;
				targetPositionY = players[pIndex].y;
			} else {
				targetPositionX = (Math.random() - 0.5) * maxX;
				targetPositionY = (Math.random() - 0.5) * maxX;
			}

			for (var i = 0; i < enemyNum; i++) {
				var cos = Math.cos(angle * i + angleDiff);
				var sin = Math.sin(angle * i + angleDiff);

				var x = cos * 100 * radPer + targetPositionX | 0;
				var y = sin * 100 * radPer + targetPositionY | 0;
				var enemy = new go.Enemy(x, y, enemyType);

				enemy.vx = -cos * 4 | 0;
				enemy.vy = -sin * 4 | 0;

				enemy.individualUpdate = function(self) {
					if(self.counter > 60) {
						self.x += self.vx;
						self.y += self.vy;
					}
				};

				enemys.push(enemy);
			}
		}
	}

	// あるプレイヤーを追尾
	function stalker(enemyType, enemyNum) {
		var playersLength = players.length;
		var angle = Math.PI  / enemyNum;

		// 標的がアクティブでないとき生成失敗
		var pIndex = Math.random() * playersLength | 0;
		if(players[pIndex].state == "WAIT") {
			return;
		}
		var angleDiff = Math.random() * (180 / Math.PI);
		if(playersLength > 0) {
			for (var i = 0; i < enemyNum; i++) {
				var cos = Math.cos(angle * i + angleDiff);
				var sin = Math.sin(angle * i + angleDiff);

				var x = cos * 100 + players[pIndex].x | 0;
				var y = sin * 100 + players[pIndex].y | 0;
				var enemy = new go.Enemy(x, y, enemyType);
				enemy.vx = (players[pIndex].x < x) ? -2 : 2;
				enemy.vy = (players[pIndex].y < y) ? -2 : 2;
				enemy.individualUpdate = function(self) {
					var d = 60;
					if(players[pIndex]) {
						if(players[pIndex].state == "WAIT") {
							self.x += self.vx;
							self.y += self.vy;
						}
						else if(self.counter > 60) {
							var dx = Math.abs(self.x - players[pIndex].x) < d;
							var dy = Math.abs(self.y - players[pIndex].y) < d;
							if(dx) {
								self.vy = (players[pIndex].y < self.y) ? -2 : 2;
							}
							if(dy) {
								self.vx = (players[pIndex].x < self.x) ? -2 : 2;
							}
							if(!dx && !dy) {
								self.vx = (players[pIndex].x < self.x) ? -2 : 2;
								self.vy = (players[pIndex].y < self.y) ? -2 : 2;
							}
							self.x += self.vx;
							self.y += self.vy;
						}
					}
				}
				enemys.push(enemy);
			};
		}
	}
}

module.exports = socketio;