var Player = function(scene, camera, data) {
	var speed = 3;
	var d = 0.8; // カメラ操作用
	var controls = {
		moveUp: false,
		moveDown: false,
		moveLeft: false,
		moveRight: false,
		shotUp: false,
		shotDown: false,
		shotLeft: false,
		shotRight: false
	};
	var canonRadius = 20;
	var canonAngle = 0;
	var shotCounter = 0; // ショット制御用
	var damageCounter = 0 // ダメージ時、2秒間無敵

	this.id = data.id;
	this.hp = data.hp;
	this.score = data.score;
	this.state = "WAIT";

	// イベントリスナー用
	this.domElement = document;
	
	this.mesh = new THREE.Object3D();
	this.mesh.visible = false;
	this.halfSize = 5;

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

	// 砲台メッシュ
	var g = new THREE.SphereGeometry(3, 4, 4);
	var m = new THREE.MeshLambertMaterial({color: color});
	var canon = new THREE.Mesh(g, m);
	canon.position.set(canonRadius, 0, 0);
	this.mesh.add(canon);
	this.mesh.position.set(data.x, data.y, 0);
	camera.position.x = data.x;
	camera.position.y = data.y;

	// 弾の管理
	this.bullets = new THREE.Object3D();

	scene.add(this.mesh);
	scene.add(this.bullets);

	// 状態更新
	this.update = function() {
		// ステータス情報の表示更新
		$("#gameScore").html(this.score);
		$("#gameHp").html(this.hp);

		// 待機状態のときは状態更新なし
		if(this.state != "WAIT") {
			this.mesh.visible = true;

			// ステート毎の処理
			if(this.state == "DAMAGE") {
				damageCounter++;
				if(damageCounter > 120) {
					damageCounter = 0;
					this.state = "NORMAL";
				}
			}

			if(controls.moveLeft) this.mesh.position.x -= speed;
			if(controls.moveUp) this.mesh.position.y += speed;
			if(controls.moveRight) this.mesh.position.x += speed;
			if(controls.moveDown) this.mesh.position.y -= speed;

			core.rotation.x += 0.05;
			core.rotation.y += 0.05;

			// カメラ移動
			var targetPositionX = camera.position.x * d + this.mesh.position.x * (1 - d);
			var targetPositionY = camera.position.y * d + this.mesh.position.y * (1 - d);
			camera.position.x = targetPositionX;
			camera.position.y = targetPositionY;
			camera.lookAt(new THREE.Vector3(targetPositionX, targetPositionY, 0));

			// ショット関連
			shotCounter++;
			if(controls.shotLeft | controls.shotUp | controls.shotRight | controls.shotDown) {
				// 砲台移動
				var targetAngle = Math.atan2(controls.shotUp - controls.shotDown, controls.shotRight - controls.shotLeft);
				var halfPI = Math.PI / 2;
				if(canonAngle >= halfPI && targetAngle <= -halfPI) {
					canonAngle = canonAngle * d + (targetAngle + Math.PI * 2) * (1 - d);
				} else {
					canonAngle = canonAngle * d + targetAngle * (1 - d);
				}
				canon.position.set(canonRadius * Math.cos(canonAngle), canonRadius * Math.sin(canonAngle), 0);

				// ショット
				if(shotCounter > 6) {
					var g = new THREE.SphereGeometry(8, 6, 6);
					var m = new THREE.MeshBasicMaterial({color: color});
					var bullet = new THREE.Mesh(g, m);
					bullet.position.set(this.mesh.position.x, this.mesh.position.y, 0);
					bullet.speedX = 8 * Math.cos(canonAngle);
					bullet.speedY = 8 * Math.sin(canonAngle);
					bullet.counter = 0;
					bullet.atk = 20;
					bullet.halfSize = 4
					this.bullets.add(bullet);
					shotCounter = 0;
				}
			}

			// 自弾処理
			var removeBullets = [];
			this.bullets.children.forEach(function(b) {
				b.position.x += b.speedX;
				b.position.y += b.speedY;
				b.counter++;

				if(b.counter > 60 || !b.visible) {
					removeBullets.push(b);
				}
			});

			// 自弾削除
			for (var i = 0; i < removeBullets.length; i++) {
				this.bullets.remove(removeBullets[i]);
			}
		}
	};

	// イベントリスナー
	this.domElement.addEventListener('keydown', onKeyDown, false);
	this.domElement.addEventListener('keyup', onKeyUp, false);

	function onKeyDown(e) {
		switch(e.keyCode) {
			case 37: // key "Left"
			e.preventDefault();
			controls.shotLeft = true;
			break;

			case 38: // key "Up"
			e.preventDefault();
			controls.shotUp = true;
			break;

			case 39: // key "Right"
			e.preventDefault();
			controls.shotRight = true;
			break;

			case 40: // key "Down"
			e.preventDefault();
			controls.shotDown = true;
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
			controls.shotLeft = false;
			break;

			case 38:
			e.preventDefault();
			controls.shotUp = false;
			break;

			case 39:
			e.preventDefault();
			controls.shotRight = false;
			break;

			case 40:
			e.preventDefault();
			controls.shotDown = false;
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