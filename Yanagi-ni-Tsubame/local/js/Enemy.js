var Enemy = function(position, type) {
	var c = new THREE.Color();
	c.setHSL(Math.random(), 1.0, 0.5);
	var g = new THREE.BoxGeometry(15, 15, 15);
	var m = new THREE.MeshLambertMaterial({color : c});
	this.mesh = new THREE.Mesh(g, m);

	this.update = function() {
		this.mesh.rotation.x += 0.05;
		this.mesh.rotation.y += 0.05;
	}
}