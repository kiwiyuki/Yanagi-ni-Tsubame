var socket = require("socket.io");

function socketio (server) {
	var io = socket.listen(server);

	// サーバー接続処理
	io.sockets.on('connection', function(socket) {
		// 初回データ送信
		socket.json.emit('first_message', {msg : "first_message receive!"},function () {
			console.log("first_message transmit!");
		});
	});

	// 全プレイヤーデータ送信（毎秒30回）
	// setInterval(function() {
	// 	io.sockets.json.emit('world_data', world_data);
	// }, 33);
}

module.exports = socketio;