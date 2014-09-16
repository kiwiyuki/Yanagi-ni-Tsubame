var Player = function(camera, domElement) {
	var speed = 3;
	var d = 0.8; // カメラ操作用
	var controls = {
		moveUp: false,
		moveDown: false,
		moveLeft: false,
		moveRight: false
	};

	this.hp = 0;
	this.id = "";

	this.domElement = (domElement !== undefined) ? domElement : document;
	this.mesh = new THREE.Object3D();
	for (var i = 0; i < 8; i++) {
		var ix = i & 1;
		var iy = (i >> 1) & 1;
		var iz = (i >> 2) & 1;
		var g = new THREE.BoxGeometry(4, 4, 4);
		var m = new THREE.MeshLambertMaterial({color : 0xff0000});
		var box = new THREE.Mesh(g, m);
		box.position.set(3 - 6 * ix, 3 - 6 * iy, 3 - 6 * iz);
		this.mesh.add(box);
	}

	this.update = function() {
		if(controls.moveLeft) this.mesh.position.x -= speed;
		if(controls.moveUp) this.mesh.position.y += speed;
		if(controls.moveRight) this.mesh.position.x += speed;
		if(controls.moveDown) this.mesh.position.y -= speed;

		this.mesh.rotation.x += 0.05;
		this.mesh.rotation.y += 0.05;

		// カメラ移動
		var targetPositionX = camera.position.x * d + this.mesh.position.x * (1 - d);
		var targetPositionY = camera.position.y * d + this.mesh.position.y * (1 - d);
		camera.position.x = targetPositionX;
		camera.position.y = targetPositionY;
		camera.lookAt(new THREE.Vector3(targetPositionX, targetPositionY, 0));
	};

	// イベントリスナー
	this.domElement.addEventListener('keydown', onKeyDown, false);
	this.domElement.addEventListener('keyup', onKeyUp, false);

	function onKeyDown(e) {
		switch(e.keyCode) {
			case 37: // key "Left"
			e.preventDefault();
			controls.moveLeft = true;
			break;

			case 38: // key "Up"
			e.preventDefault();
			controls.moveUp = true;
			break;

			case 39: // key "Right"
			e.preventDefault();
			controls.moveRight = true;
			break;

			case 40: // key "Down"
			e.preventDefault();
			controls.moveDown = true;
			break;

			// WASD
			case 65: // key "A"
			e.preventDefault();
			controls.moveLeft = true;
			break;

			case 87: // key "W"
			e.preventDefault();
			controls.moveUp = true;
			break;

			case 68: // key "D"
			e.preventDefault();
			controls.moveRight = true;
			break;

			case 83: // key "S"
			e.preventDefault();
			controls.moveDown = true;
			break;
		}
	}

	function onKeyUp(e) {
		switch(event.keyCode){
			case 37:
			e.preventDefault();
			controls.moveLeft = false;
			break;

			case 38:
			e.preventDefault();
			controls.moveUp = false;
			break;

			case 39:
			e.preventDefault();
			controls.moveRight = false;
			break;

			case 40:
			e.preventDefault();
			controls.moveDown = false;
			break;

			// WASD
			case 65: // key "A"
			e.preventDefault();
			controls.moveLeft = false;
			break;

			case 87: // key "W"
			e.preventDefault();
			controls.moveUp = false;
			break;

			case 68: // key "D"
			e.preventDefault();
			controls.moveRight = false;
			break;

			case 83: // key "S"
			e.preventDefault();
			controls.moveDown = false;
			break;
		}
	}
};