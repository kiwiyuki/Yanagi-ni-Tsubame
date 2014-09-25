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
	this.id = _id;
	this.x = _x;
	this.y = _y;
	this.type = _type;
	this.hp = 0;
	this.counter = 0;

	switch(_type) {
		case 'test':
			var speed = 6;
			var d = 360;

			this.update = function() {
				this.x += speed;

				if(this.x > _x + d) {
					this.x = _x + d;
					speed = -speed;
				} else if (this.x < _x - d) {
					this.x = _x - d;
					speed = -speed;
				}
			};
		break;
	}
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