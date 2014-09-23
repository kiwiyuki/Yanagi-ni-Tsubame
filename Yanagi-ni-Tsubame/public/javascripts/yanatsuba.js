// メイン
$(document).ready(function() {
	// 大域変数
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	var socket;
	var scene, camera, renderer, background, player, avatarManager;
	var gameDomElement = document.getElementById("game");
	var bgColor = 0x333333;

	// socket通信開始
	socket = io.connect();

	// 初回データ受信
	socket.on("first_message", function(data) {
		console.log(data);

		// プレイヤーデータ
		// 敵データ
		// アイテムデータ

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

		// プレイヤー
		player = new Player(scene, camera, data.player);

		// 他プレイヤー（アバター）
		avatarManager = new AvatarManager(scene, data.player.id);
		avatarManager.update(data.players);

		// 敵
		// scene.add(new Enemy().mesh)

		// イベント追加
		window.addEventListener('resize', onWindowResize, false);

		// ロードメッセージ削除
		gameDomElement.removeChild(document.getElementById("load_msg"));

		// ループ開始
		requestAnimationFrame(loop);
	});

	// 鯖データ受信
	socket.on('server_update', function(data) {
		avatarManager.update(data.players);
	});

	// ループ
	function loop() {
		// 状態更新
		background.update();
		player.update();
		avatarManager.animate();

		// レンダリング
		renderer.render(scene, camera);

		requestAnimationFrame(loop);
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