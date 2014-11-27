var Background = function() {
	var bg = new THREE.Object3D();
	var hugeBoxNum = 12;
	var d = 0.95;
	var counter = 0;
	var HugeBox = function() {
		var g = new THREE.BoxGeometry(150, 150, 800);
		var m = new THREE.MeshLambertMaterial({color : 0x222222});
		var box = new THREE.Mesh(g, m);

		return box;
	};

	for (var j = 0; j < hugeBoxNum; j++) {
		for (var i = 0; i < hugeBoxNum; i++) {
			var hugeBox = new HugeBox();
			hugeBox.position.set((i - hugeBoxNum / 2) * 200, (j - hugeBoxNum / 2) * 200, -900);
			hugeBox.flag = Math.random() < 0.5;

			bg.add(hugeBox);
		}
	}

	return {
		mesh : bg,

		update : function() {
			// hugeBoxの上下移動
			for (var i = 0; i < bg.children.length; i++) {
				if(bg.children[i].flag) {
					bg.children[i].position.z = bg.children[i].position.z * d - 900 * (1 - d);
				} else {
					bg.children[i].position.z = bg.children[i].position.z * d - 1100 * (1 - d);
				}
			}

			// 3秒ごとに上下移動フラグを変更
			if(counter > 180) {
				for (var i = 0; i < bg.children.length; i++) {
					bg.children[i].flag = Math.random() < 0.5;
				}

				counter = 0;
			}
			
			counter++;
		}
	};
}