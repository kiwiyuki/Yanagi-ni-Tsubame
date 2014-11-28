function Bullet(x, y, angle, hue) {
	this.speedX = 6 * Math.cos(angle);
	this.speedY = 6 * Math.sin(angle);
	this.counter = 0;
	this.type = "y";
	this.halfSize = 4;
	this.tsubame = new THREE.Object3D();
	this.mesh = new THREE.Object3D();

	var dateNow = Date.now().toString();
	this.id = (dateNow.substring(dateNow.length - 7) + (Math.random() * 100)) | 0;

	var color = new THREE.Color();
	color.setHSL(hue, 0.6, 0.5);
	var g = new THREE.BoxGeometry(4, 8, 0.5);
	var m = new THREE.MeshLambertMaterial({color : color});
	var plate = new THREE.Mesh(g, m);

	var wing = new THREE.Object3D();
	wing.add(plate);

	plate = plate.clone();
	plate.position.z = 2;
	plate.position.y = -3;
	wing.add(plate);

	plate = plate.clone();
	plate.position.z = -2;
	plate.position.y = 3;
	wing.add(plate);

	wing.position.z = 3;
	wing.position.y = -1;
	this.tsubame.add(wing);

	wing = wing.clone();
	wing.position.z = -3;
	wing.rotation.y = Math.PI;
	this.tsubame.add(wing);
	this.mesh.add(this.tsubame);
	this.mesh.position.set(x, y, 0);
	this.mesh.rotation.z = angle - Math.PI / 2;
}

Bullet.prototype.getData = function() {
	return {
		id : this.id,
		x : this.mesh.position.x,
		y : this.mesh.position.y,
		angle : this.mesh.rotation.z
	};
};