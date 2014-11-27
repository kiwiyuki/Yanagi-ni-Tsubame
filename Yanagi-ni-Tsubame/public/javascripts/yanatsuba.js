// メイン
$(document).ready(function() {
	// 大域変数
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	var socket, localData;
	var scene, camera, renderer, background, player, avatarManager, enemyManager, itemManager, soundManager;
	var gameDomElement = document.getElementById("game");
	var bgColor = 0x333333;
	
	var GAME = {};
	GAME.utils = {};
	GAME.utils.state = {
		LOAD : 1,
		TITLE : 2,
		PLAY : 3,
		GAMEOVER : 4
	};
	GAME.state = GAME.utils.state.LOAD;
	
	// socket通信開始
	socket = io.connect();

	// 初回データ受信
	socket.on("first_message", function(data) {
		console.log(data);
		
		// 初期化
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

		// メッシュ
		GAME.mf = new MeshFactory();

		// ローカルデータ定義
		localData = {};
		localData.player = {};
		localData.atkEnemys = [];
		localData.getItems = [];

		// 音
		soundManager = new SoundManager(0);

		// プレイヤー
		player = new Player(scene, camera, data.player, soundManager);

		// オブジェクトマネージャー
		om = new ObjectManager();

		// イベント追加
		window.addEventListener('resize', onWindowResize, false);
		window.addEventListener('keydown', onKeyDown, false);

		// 再接続時のエラー防止
		if(GAME.state == GAME.utils.state.LOAD) {
			// ロードメッセージ削除
			gameDomElement.removeChild(document.getElementById("load_msg"));

			// 状態遷移
			GAME.state = GAME.utils.state.TITLE;
		}

		// ループ開始
		requestAnimationFrame(loop);
	});

	// 鯖データ受信
	socket.on('server_update', function(data) {
		// ロード時は情報の更新をしない
		if(GAME.state != GAME.utils.state.LOAD) {
			// スコア更新

			om.serverUpdate(data);
		}

		// console.log("objects : " + (data.players.length + data.enemys.length + data.items.length));
	});

	// 死亡時メッセージ受信
	socket.json.on("dead_message", function(data) {
		// player.mesh.visible = false;
		// player.hp = data.hp;
		// player.score = data.score;

		GAME.state = GAME.utils.state.GAMEOVER;
		$("#gameOver").removeClass("gameUIHidden");
	});

	// ループ
	function loop() {
		// 状態更新
		om.localUpdate();
		player.update();

		// 弾幕情報の取得

		// 鯖へデータ送信
		localData.player = {
			id : player.id,
			x : player.mesh.position.x,
			y : player.mesh.position.y,
			// hp : player.hp,
			state : player.state,
			bullets : player.bulletsData
		};

		if(player.state != "WAIT") {
			socket.json.emit("player_data", localData);

			if(player.hp <= 0) {
				player.state = "WAIT";
			}
		}

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

	function onKeyDown(e) {
		// エンターキー
		if(e.keyCode == 13) {
			// ゲーム開始時
			if(GAME.state == GAME.utils.state.TITLE) {
				GAME.state = GAME.utils.state.PLAY;
				$("#gameTitle").addClass("gameUIHidden");
				player.state = "NORMAL";
			} else if(GAME.state == GAME.utils.state.GAMEOVER) {
				GAME.state = GAME.utils.state.TITLE;
				$("#gameOver").addClass("gameUIHidden");
				$("#gameTitle").removeClass("gameUIHidden");
			}
		}
	}
});