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

	this.update = function(allPlayers) {
		console.log(avatarsArray.length);

		// 鯖にいないプレイヤーの検索
		// var removeAvatarsID = [];
		// avatarsArray.forEach(function(avatar) {
		// 	var flag = allPlayers.filter(function(item) {
		// 		return item == avatar.id;
		// 	});

		// 	if(!flag) {
		// 		removeAvatarsID.push(avatar.id);
		// 	}
		// });

		// 他プレイヤーの削除
		// removeAvatarsID.forEach(function(avatar) {
		// 	var index = avatarsArray.filter(function(item, index) {
		// 		if(item == avatar.id) return index;
		// 	});

		// 	scene.remove(avatarsArray[index].mesh);
		// 	avatarsArray.splice(index, 1);
		// });

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