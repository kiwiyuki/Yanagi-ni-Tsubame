var EnemyManager = function(scene, player, atkEnemys, soundManager) {
	var enemysArray = [];

	var Enemy = function(data) {
		this.id = data.id;
		this.hp = data.hp;
		this.atk = data.atk;
		this.mesh = new THREE.Object3D();
		this.mesh.position.set(data.x, data.y, 0);
		this.halfSize = 0;
		this.counter = data.counter;
		this.blinkCounter = 0; // 点滅エフェクト用

		switch(data.type) {
			case "test":
			this.halfSize = 9;

			var g = new THREE.BoxGeometry(20, 20, 20);
			var m = new THREE.MeshLambertMaterial({color : 0xff0000});
			this.mesh.add(new THREE.Mesh(g, m));

			this.animate = function() {
				this.mesh.rotation.x += 0.05;
				this.mesh.rotation.y += 0.05;
			};
			break;

			case "akatan":
			this.halfSize = 12;

			var g = new THREE.BoxGeometry(6, 10, 1);
			var m = new THREE.MeshLambertMaterial({color : 0xff1111});
			var box = new THREE.Mesh(g, m);
			box.position.y = 9;
			this.mesh.add(box);

			box = new THREE.Mesh(g, m);
			box.position.x = -9;
			box.rotation.z = Math.PI / 2;
			this.mesh.add(box);

			box = new THREE.Mesh(g, m);
			box.position.x = 9;
			box.rotation.z = Math.PI / 2;
			this.mesh.add(box);

			box = new THREE.Mesh(g, m);
			box.position.y = -9;
			this.mesh.add(box);

			this.animate = function() {
				this.mesh.rotation.z -= 0.05;
			};
			break;

			case "aotan":
			this.halfSize = 12;

			var g = new THREE.BoxGeometry(6, 10, 2);
			var m = new THREE.MeshLambertMaterial({color : 0x5522ff});
			var box = new THREE.Mesh(g, m);
			box.position.y = 9;
			this.mesh.add(box);

			box = new THREE.Mesh(g, m);
			box.position.x = -9;
			box.rotation.z = Math.PI / 2;
			this.mesh.add(box);

			box = new THREE.Mesh(g, m);
			box.position.x = 9;
			box.rotation.z = Math.PI / 2;
			this.mesh.add(box);

			box = new THREE.Mesh(g, m);
			box.position.y = -9;
			this.mesh.add(box);

			this.animate = function() {
				this.mesh.rotation.z += 0.05;
			};
			break;
		}
	}

	this.localUpdate = function() {
		enemysArray.forEach(function(enemy) {
			enemy.animate();

			// 登場後1秒間点滅
			enemy.mesh.visible = true;
			if(enemy.counter < 60) {
				if(enemy.blinkCounter <= 3) {
					enemy.mesh.visible = false;
				} else if(enemy.blinkCounter > 7) {
					enemy.blinkCounter = 0;
				}

				enemy.blinkCounter++;
			}
		});

		// 自弾と敵の当たり判定
		player.bullets.forEach(function(bullet) {
			var bulletHitBox = new THREE.Box2(new THREE.Vector2(bullet.mesh.position.x - bullet.halfSize, bullet.mesh.position.y - bullet.halfSize),
				new THREE.Vector2(bullet.mesh.position.x + bullet.halfSize, bullet.mesh.position.y + bullet.halfSize));

			enemysArray.forEach(function(enemy) {
				// 登場後1秒間、敵は無敵
				if(enemy.counter > 60) {
					var enemyHitBox = new THREE.Box2(new THREE.Vector2(enemy.mesh.position.x - enemy.halfSize, enemy.mesh.position.y - enemy.halfSize),
						new THREE.Vector2(enemy.mesh.position.x + enemy.halfSize, enemy.mesh.position.y + enemy.halfSize));

					if(bulletHitBox.isIntersectionBox(enemyHitBox)) {
						atkEnemys.push({ id : enemy.id, damage : bullet.atk });
						bullet.mesh.visible = false;

						soundManager.seHit();
					}
				}
			});
		});

		// プレイヤーと敵の当たり判定
		if(player.state == "NORMAL") {
			var playerHitBox = new THREE.Box2(new THREE.Vector2(player.mesh.position.x - player.halfSize, player.mesh.position.y - player.halfSize),
				new THREE.Vector2(player.mesh.position.x + player.halfSize, player.mesh.position.y + player.halfSize));

			enemysArray.forEach(function(enemy) {
				if(enemy.counter > 60) {
					var enemyHitBox = new THREE.Box2(new THREE.Vector2(enemy.mesh.position.x - enemy.halfSize, enemy.mesh.position.y - enemy.halfSize),
						new THREE.Vector2(enemy.mesh.position.x + enemy.halfSize, enemy.mesh.position.y + enemy.halfSize));

					if(playerHitBox.isIntersectionBox(enemyHitBox)) {
						player.state = "DAMAGE";
						player.hp -= enemy.atk;
					}
				}
			});
		}
	};

	this.update = function(allEnemys) {
		// 鯖にいない敵の検索
		var removeEnemysID = [];
		enemysArray.forEach(function(enemy) {
			// TODO filter関数使いたかった
			var flag = true;
			for (var i = 0; i < allEnemys.length; i++) {
				if(allEnemys[i].id == enemy.id) {
					flag = false;
					break;
				}
			};

			if(flag) {
				removeEnemysID.push(enemy.id);
			}
		});

		// 敵の削除
		removeEnemysID.forEach(function(rmEnemyID) {
			for (var i = 0; i < enemysArray.length; i++) {
				if(enemysArray[i].id == rmEnemyID) {
					scene.remove(enemysArray[i].mesh);
					enemysArray.splice(i, 1);
					break;
				}
			};
		});

		// 敵が自前の配列に登録してあるか検索
		allEnemys.forEach(function(ae) {
				// 見つかれば位置の更新
				// そうじゃなければ新規登録
				var isFinded = false;

				enemysArray.forEach(function(enemy) {
					if(enemy.id == ae.id) {
						enemy.mesh.position.set(ae.x, ae.y, 0);
						enemy.counter = ae.counter;
						isFinded = true;
					};
				});

				if(!isFinded) {
					var newEnemy = new Enemy(ae);
					enemysArray.push(newEnemy);
					scene.add(newEnemy.mesh);

					soundManager.seEnemyBorn();
				}
			});
	};
};