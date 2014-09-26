var EnemyManager = function(scene, player, atkEnemys) {
	var enemysArray = [];

	var Enemy = function(data) {
		this.id = data.id;
		this.hp = data.hp;
		this.mesh = new THREE.Object3D();
		this.mesh.position.set(data.x, data.y, 0);
		this.halfSize = 0;

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

			case "":
			break;
		}
	}

	var isCollided = false;
	this.localUpdate = function() {
		enemysArray.forEach(function(enemy) {
			enemy.animate();
		});

		// 自弾と敵の当たり判定
		if(isCollided) {
			atkEnemys = [];
			player.bullets.children.forEach(function(bullet) {
				var bulletHitBox = new THREE.Box2(new THREE.Vector2(bullet.position.x - bullet.halfSize, bullet.position.y - bullet.halfSize),
					new THREE.Vector2(bullet.position.x + bullet.halfSize, bullet.position.y + bullet.halfSize));

				enemysArray.forEach(function(enemy) {
					var enemyHitBox = new THREE.Box2(new THREE.Vector2(enemy.mesh.position.x - enemy.halfSize, enemy.mesh.position.y - enemy.halfSize),
						new THREE.Vector2(enemy.mesh.position.x + enemy.halfSize, enemy.mesh.position.y + enemy.halfSize));

					if(bulletHitBox.isIntersectionBox(enemyHitBox)) {
						atkEnemys.push({ id : enemy.id, damage : bullet.atk });
						bullet.visible = false;
					}
				});
			});
		} else {
			isCollided = true;
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
						isFinded = true;
					};
				});

				if(!isFinded) {
					var newEnemy = new Enemy(ae);
					enemysArray.push(newEnemy);
					scene.add(newEnemy.mesh);
				}
			});
	};
};