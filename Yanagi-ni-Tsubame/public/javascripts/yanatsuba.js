// メイン
$(document).ready(function() {
	// 大域変数
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	var socket, localData;
	var scene, camera, renderer, background, player, avatarManager, enemyManager, itemManager;
	var gameDomElement = document.getElementById("game");
	var bgColor = 0x333333;
	var state = {
		LOAD : 1,
		TITLE : 2,
		PLAY : 3,
	};
	var gameState = state.LOAD;

	// socket通信開始
	socket = io.connect();

	// 初回データ受信
	socket.on("first_message", function(data) {
		console.log(data);

		// 初期化
		// TODO タイトルへ遷移
		// シーン
		scene = new THREE.Scene();

		// カメラ
		camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 1500);
		camera.position.set(0, 0, 500);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		// フォグ
		scene.fog = new THREE.Fog(bgColor, 1250, 1500);

		// レンダラー
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(WIDTH, HEIGHT);
		renderer.setClearColor(bgColor, 1);
		gameDomElement.appendChild(renderer.domElement);

		// 光源
		var light = new THREE.DirectionalLight(0xffffff, 0.95);
		light.position.set(0, 0, 1000);
		scene.add(light);

		// 背景
		background = new Background();
		scene.add(background.mesh);

		// ローカルデータ定義
		localData = {};
		localData.player = {};
		localData.atkEnemys = [];

		// プレイヤー
		player = new Player(scene, camera, data.player);

		// 他プレイヤー（アバター）
		avatarManager = new AvatarManager(scene, player);
		avatarManager.update(data.players);

		// 敵
		enemyManager = new EnemyManager(scene, player, localData.atkEnemys);
		enemyManager.update(data.enemys);

		// アイテム
		itemManager = new ItemManager(scene, player);
		itemManager.update(data.items);

		// イベント追加
		window.addEventListener('resize', onWindowResize, false);

		// ロードメッセージ削除
		gameDomElement.removeChild(document.getElementById("load_msg"));

		// 状態遷移
		gameState = state.TITLE;

		// ループ開始
		requestAnimationFrame(loop);
	});

	// 鯖データ受信
	socket.on('server_update', function(data) {
		// ロード時は情報の更新をしない
		if(gameState != state.LOAD) {
			// プレイヤー情報更新
			for (var i = 0; i < data.players.length; i++) {
				if(data.players[i].id == player.id) {
					player.score = data.players[i].score;
					break;
				}
			}

			avatarManager.update(data.players);
			enemyManager.update(data.enemys);
		}
	});

	// ループ
	function loop() {
		// 状態更新
		background.update();
		player.update();
		avatarManager.animate();
		enemyManager.localUpdate();

		// レンダリング
		renderer.render(scene, camera);

		requestAnimationFrame(loop);

		// 鯖へデータ送信
		localData.player = {
			id : player.id,
			x : player.mesh.position.x,
			y : player.mesh.position.y,
			hp : player.hp,
			state : player.state
		};

		socket.json.emit("player_data", localData);
	}

	// イベントリスナー
	function onWindowResize(e) {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
		renderer.setSize(WIDTH, HEIGHT);
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	}
});