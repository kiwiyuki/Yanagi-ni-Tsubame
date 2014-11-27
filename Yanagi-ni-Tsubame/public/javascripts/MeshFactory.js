var MeshFactory = function() {
	this.generate = {}; // 引数を受け取り、一からメッシュを作るとき

	/**********

	プレイヤー（アバター）

	**********/

	this.generate.player = function(hue) {
	};

	/**********

	アイテム

	**********/

	// exp
	var exp = new THREE.Object3D();

	for (var i = 0; i < 8; i++) {
		var ix = i & 1;
		var iy = (i >> 1) & 1;
		var iz = (i >> 2) & 1;
		var g = new THREE.BoxGeometry(3, 3, 3);
		var m = new THREE.MeshLambertMaterial({color : 0xeeeeee});
		var box = new THREE.Mesh(g, m);
		box.position.set(2 - 4 * ix, 2 - 4 * iy, 2 - 4 * iz);
		exp.add(box);
	}

	this.exp = exp;
};