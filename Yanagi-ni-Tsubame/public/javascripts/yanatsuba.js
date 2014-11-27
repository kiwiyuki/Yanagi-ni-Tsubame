// メイン
$(document).ready(function() {
	// 変数定義
	var socket, localData;
	var player;
	var GAME = {};
	GAME.WIDTH = window.innerWidth;
	GAME.HEIGHT = window.innerHeight;
	GAME.domElement = document.getElementById("game");
	GAME.bgColor = 0x333333;
	
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
		GAME.scene = new THREE.Scene();

		// カメラ
		GAME.camera = new THREE.PerspectiveCamera(45, GAME.WIDTH / GAME.HEIGHT, 1, 1500);
		GAME.camera.position.set(0, 0, 500);
		GAME.camera.lookAt(new THREE.Vector3(0, 0, 0));

		// フォグ
		GAME.scene.fog = new THREE.Fog(GAME.bgColor, 1250, 1500);

		// レンダラー
		GAME.renderer = new THREE.WebGLRenderer();
		GAME.renderer.setSize(GAME.WIDTH, GAME.HEIGHT);
		GAME.renderer.setClearColor(GAME.bgColor, 1);
		GAME.domElement.appendChild(GAME.renderer.domElement);

		// 光源
		var light = new THREE.DirectionalLight(0xffffff, 0.95);
		light.position.set(0, 0, 1000);
		GAME.scene.add(light);

		// メッシュ
		GAME.mf = new MeshFactory();

		// ローカルデータ定義
		localData = {};
		localData.player = {};
		localData.atkEnemys = [];
		localData.getItems = [];

		// 音
		GAME.soundManager = new SoundManager(0);

		// プレイヤー
		player = new Player(GAME.scene, GAME.camera, data.player, GAME.soundManager);

		// オブジェクトマネージャー
		GAME.objectManager = new ObjectManager();

		// イベント追加
		window.addEventListener('resize', onWindowResize, false);
		window.addEventListener('keydown', onKeyDown, false);

		// 再接続時のエラー防止
		if(GAME.state == GAME.utils.state.LOAD) {
			// ロードメッセージ削除
			GAME.domElement.removeChild(document.getElementById("load_msg"));

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

			GAME.objectManager.serverUpdate(data);
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
		GAME.objectManager.localUpdate();
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
		GAME.renderer.render(GAME.scene, GAME.camera);

		requestAnimationFrame(loop);
	}

	// イベントリスナー
	function onWindowResize(e) {
		GAME.WIDTH = window.innerWidth;
		GAME.HEIGHT = window.innerHeight;
		GAME.renderer.setSize(GAME.WIDTH, GAME.HEIGHT);
		GAME.camera.aspect = GAME.WIDTH / GAME.HEIGHT;
		GAME.camera.updateProjectionMatrix();
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