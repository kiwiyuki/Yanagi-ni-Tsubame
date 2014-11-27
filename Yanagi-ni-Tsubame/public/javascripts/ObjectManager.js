var ObjectManager = function(GAME){
	/**********

	背景

	**********/

	var background = new Background();
	GAME.scene.add(background.mesh);


	// ローカルの状態更新
	this.localUpdate = function() {
		background.update();
	};

	// サーバーデータ受信時の状態更新
	this.serverUpdate = function(data) {

	};
};