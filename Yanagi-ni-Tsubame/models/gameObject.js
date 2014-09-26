var Player = function(_id, _x, _y, _color) {
	return {
		id: _id,
		x: _x,
		y: _y,
		shots: [],
		hp: 0,
		state: "NORMAL",
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
		// ヤナギニツバメ零号機
		case 'test':
		this.hp = 40;
		var speed = 3;
		var d = 360;

		this.update = function() {
			// 移動
			this.x += speed;

			if(this.x > _x + d) {
				this.x = _x + d;
				speed = -speed;
			} else if (this.x < _x - d) {
				this.x = _x - d;
				speed = -speed;
			}

			// 発生から1分で自動的に死ぬ
			this.counter++;
			if(this.counter > 3600) {
				this.hp = 0;
			}
		}
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