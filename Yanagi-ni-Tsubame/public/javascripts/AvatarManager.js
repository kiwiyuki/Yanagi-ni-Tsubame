var AvatarManager = function(scene, playerID) {
	var avatarsArray = [];

	var Avatar = function(data) {
		this.id = data.id;

		this.mesh = new THREE.Object3D();

		// 本体メッシュ
		var core = new THREE.Object3D();
		var color = new THREE.Color();
		color.setHSL(data.color, 1.0, 0.5);
		for (var i = 0; i < 8; i++) {
			var ix = i & 1;
			var iy = (i >> 1) & 1;
			var iz = (i >> 2) & 1;
			var g = new THREE.BoxGeometry(4, 4, 4);
			var m = new THREE.MeshLambertMaterial({color : color});
			var box = new THREE.Mesh(g, m);
			box.position.set(3 - 6 * ix, 3 - 6 * iy, 3 - 6 * iz);
			core.add(box);
		}
		this.mesh.add(core);
	};

	this.animate = function() {
		avatarsArray.forEach(function(avatar) {
			avatar.mesh.rotation.x += 0.05;
			avatar.mesh.rotation.y += 0.05;
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
			if(playerID != p.id) {
				// 見つかれば位置の更新
				// そうじゃなければ新規登録
				var isFinded = false;

				avatarsArray.forEach(function(avatar) {
					if(avatar.id == p.id) {
						avatar.mesh.position.set(p.x, p.y, 0);
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