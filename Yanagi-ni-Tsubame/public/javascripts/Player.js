var Player = function(scene, camera, data, soundManager) {
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
	var blinkCounter = 0; // 点滅エフェクト用

	this.id = data.id;
	this.hp = data.hp;
	this.score = data.score;
	this.state = "WAIT"; // "WAIT" "NORMAL" "DAMAGE" "DEAD"

	// イベントリスナー用
	this.domElement = document;
	
	this.mesh = new THREE.Object3D();
	this.mesh.visible = false;
	this.halfSize = 5;

	// 本体メッシュ
	var core = new THREE.Object3D();
	var color = new THREE.Color();
	this.hue = data.color;
	color.setHSL(this.hue, 1.0, 0.5);
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
	this.bullets = [];
	this.bulletsData = [];

	scene.add(this.mesh);

	// 弾定義
	function Bullet(x, y, angle, hue) {
		this.speedX = 6 * Math.cos(angle);
		this.speedY = 6 * Math.sin(angle);
		this.counter = 0;
		this.atk = 20;
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
				// 点滅エフェクト
				if(blinkCounter <= 3) {
					this.mesh.visible = false;
				} else if(blinkCounter > 7) {
					blinkCounter = 0;
				}

				damageCounter++;
				blinkCounter++;

				if(damageCounter > 120) {
					damageCounter = 0;
					this.state = "NORMAL";
				}
			}

			if(controls.moveLeft) this.mesh.position.x -= speed;
			if(controls.moveUp) this.mesh.position.y += speed;
			if(controls.moveRight) this.mesh.position.x += speed;
			if(controls.moveDown) this.mesh.position.y -= speed;

			// 行動範囲の限定
			var maxX = 1200;
			if(this.mesh.position.x > maxX) this.mesh.position.x = maxX;
			if(this.mesh.position.x < -maxX) this.mesh.position.x = -maxX;
			if(this.mesh.position.y > maxX) this.mesh.position.y = maxX;
			if(this.mesh.position.y < -maxX) this.mesh.position.y = -maxX;

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
				if(shotCounter > 10) {
					var bullet = new Bullet(this.mesh.position.x, this.mesh.position.y, canonAngle, this.hue);
					
					this.bullets.push(bullet);
					scene.add(bullet.mesh);
					
					soundManager.seShot();

					shotCounter = 0;
				}
			}
		}

		// 自弾処理
		var bulletsData = [];
		var removeBullets = [];
		this.bullets.forEach(function(b) {
			b.tsubame.rotation.y += 0.3;

			b.mesh.position.x += b.speedX;
			b.mesh.position.y += b.speedY;
			b.counter++;

			bulletsData.push(b.getData());

			if(b.counter > 40 || !b.mesh.visible) {
				removeBullets.push(b);
			}
		});
		this.bulletsData = bulletsData;

		// 自弾削除
		for (var i = 0; i < removeBullets.length; i++) {
			scene.remove(removeBullets[i].mesh);
			this.bullets.splice(this.bullets.indexOf(removeBullets[i]), 1);
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