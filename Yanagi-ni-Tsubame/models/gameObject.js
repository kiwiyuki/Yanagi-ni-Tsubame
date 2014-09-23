var Player = function(_id, _x, _y, _color) {
	return {
		id: _id,
		x: _x,
		y: _y,
		shots: [],
		hp: 0,
		state: "",
		color: _color
	};
};

var Shots = function() {
	// return {
	// 	id: 
	// };
};


var Enemy = function(_id, _x, _y, _type) {
	return {
		id: _id,
		x: _x,
		y: _y,
		type: _type,
		hp: 0,
		counter: 0
	};
};

var Item = function(_id, _x, _y, _type) {
	return {
		id: _id,
		x: _x,
		y: _y,
		type: _type,
		counter: 0
	};
};

module.exports = {
	Player: Player,
	Enemy: Enemy,
	Item: Item
};