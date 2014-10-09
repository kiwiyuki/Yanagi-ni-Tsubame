var AvatarManager = function(scene, player) {
	var avatarsArray = [];

	var Avatar = function(data) {
		this.id = data.id;
		this.state = data.state;

		this.mesh = new THREE.Object3D();
		this.mesh.position.set(data.x, data.y, 0);
		this.bullets = [];

		// 本体メッシュ
		var core = new THREE.Object3D();
		this.color = new THREE.Color();
		this.color.setHSL(data.color, 1.0, 0.5);
		for (var i = 0; i < 8; i++) {
			var ix = i & 1;
			var iy = (i >> 1) & 1;
			var iz = (i >> 2) & 1;
			var g = new THREE.BoxGeometry(4, 4, 4);
			var m = new THREE.MeshLambertMaterial({color : this.color});
			var box = new THREE.Mesh(g, m);
			box.position.set(3 - 6 * ix, 3 - 6 * iy, 3 - 6 * iz);
			core.add(box);
		}
		this.mesh.add(core);
	};

	Avatar.prototype.bulletsUpdate = function(bullets) {
		
		var bulletsLength = bullets.length;

		if(bulletsLength == 0) {
			// データが無ければ全弾消去
			if(this.bullets.length > 0) {
				for (var i = 0; i < this.bullets.length; i++) {
					scene.remove(this.bullets[i].mesh);
				}

				this.bullets = [];
			}
		} else {
			// 削除された弾の検索（毎フレームに一つだけ削除）
			if(this.bullets.length > 0) {
				for (var i = 0; i < this.bullets.length; i++) {
					var isFinded = false;

					for (var j = 0; j < bulletsLength; j++) {
						if(this.bullets[i].id == bullets[j].id) {
							isFinded = true;
							break;
						}
					}

					if(!isFinded) {
						scene.remove(this.bullets[i].mesh);
						this.bullets.splice(i, 1);
						break;
					}
				}
			}

			// 弾の検索
			for (var i = 0; i < bulletsLength; i++) {
				// 見つかれば位置の更新、そうじゃなければ新規登録
				var isFinded = false;
				for (var j = 0; j < this.bullets.length; j++) {
					if(this.bullets[j].id == bullets[i].id) {
						this.bullets[j].mesh.position.x = bullets[i].x;
						this.bullets[j].mesh.position.y = bullets[i].y;

						isFinded = true;
						break;
					}
				}

				// 弾の追加
				if(!isFinded) {
					this.bullets.push(new Bullet(bullets[i], this.color));
				}
			}
		}

	};

	function Bullet(data, color) {
		this.id = data.id;
		var g = new THREE.SphereGeometry(8, 6, 6);
		var m = new THREE.MeshBasicMaterial({color: color});
		this.mesh = new THREE.Mesh(g, m);
		this.mesh.position.set(data.x, data.y, 0);
		scene.add(this.mesh);
	}

	this.animate = function() {
		avatarsArray.forEach(function(avatar) {
			if(avatar.state == "WAIT") {
				avatar.mesh.visible = false;
			} else {
				avatar.mesh.visible = true;
				avatar.mesh.rotation.x += 0.05;
				avatar.mesh.rotation.y += 0.05;
			}
		});
	};

	this.update = function(allPlayers) {
		// 鯖にいないプレイヤーの検索
		var removeAvatarsID = [];
		avatarsArray.forEach(function(avatar) {
			// TODO filter関数使いたかった
			var flag = true;
			for (var i = 0; i < allPlayers.length; i++) {
				if(allPlayers[i].id == avatar.id) {
					flag = false;
					break;
				}
			};

			if(flag) {
				removeAvatarsID.push(avatar.id);
			}
		});

		// 他プレイヤーの削除
		removeAvatarsID.forEach(function(rmAvatarID) {
			for (var i = 0; i < avatarsArray.length; i++) {
				if(avatarsArray[i].id == rmAvatarID) {
					scene.remove(avatarsArray[i].mesh);
					avatarsArray.splice(i, 1);
					break;
				}
			};
		});

		// 自分以外のプレイヤーが配列に登録してあるか検索
		allPlayers.forEach(function(p) {
			if(player.id != p.id) {
				// 見つかれば位置の更新、そうじゃなければ新規登録
				var isFinded = false;

				avatarsArray.forEach(function(avatar) {
					if(avatar.id == p.id) {
						avatar.state = p.state;
						avatar.mesh.position.set(p.x, p.y, 0);
						avatar.bulletsUpdate(p.bullets);
						isFinded = true;
					};
				});

				if(!isFinded) {
					var a = new Avatar(p);
					avatarsArray.push(a);
					scene.add(a.mesh);
				}
			}
		});
	};
};