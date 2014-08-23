var socket = require("socket.io");

function socketio (server) {
	var io = socket.listen(server);
}

module.exports = socketio;