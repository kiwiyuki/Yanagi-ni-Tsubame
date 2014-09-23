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
		console.log("playerID : " + playerID);
		var newPlayersList = [];
		avatarsArray.forEach(function(avatar) {
			newPlayersList = allPlayers.filter(function(item) {
				console.log("p");
				if(item.id == avatar.id) {
					avatar.position.x = item.x;
					avatar.position.y = item.y;
					isFined = true;

					return false;
				}
				
				return item.id != playerID;
			});
		});

		newPlayersList.forEach(function(ply) {
			var a = new Avatar(ply);
			avatarsArray.push(a);
			scene.add(a.mesh);
		});
	};
};