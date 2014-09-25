var EnemyManager = function(scene) {
	var enemysArray = [];

	var Enemy = function(data) {
		this.id = data.id;
		this.hp = data.hp;
		this.mesh = new THREE.Object3D();
		this.mesh.position.set(data.x, data.y, 0);

		switch(data.type) {
			case "test":
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

	this.animate = function() {
		enemysArray.forEach(function(enemy) {
			enemy.animate();
		});
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