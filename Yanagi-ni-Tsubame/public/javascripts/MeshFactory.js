var MeshFactory = function() {

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


	/**********

	その他

	**********/

	this.hugeBox = (function() {
		var g = new THREE.BoxGeometry(150, 150, 800);
		var m = new THREE.MeshLambertMaterial({color : 0x222222});
		var box = new THREE.Mesh(g, m);
		
		return box;
	})();
};