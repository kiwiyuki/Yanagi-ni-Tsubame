var Player = function(_id, _x, _y, _hp, _score, _color) {
	this.id = _id;
	this.x = _x;
	this.y = _y;
	this.shots = [];
	this.hp = _hp;
	this.score = _score;
	this.state = "WAIT";
	this.color = _color;
};

var Shots = function() {
	// return {
	// 	id: 
	// };
};


var Enemy = function(_x, _y, _type) {
	this.id = "" + Date.now() + Math.random();
	this.x = _x;
	this.y = _y;
	this.type = _type;
	this.hp = 0;
	this.atk = 0;
	this.point = 0;
	this.counter = 0;

	switch(this.type) {
		// ヤナギニツバメ零号機
		case 'test':
		this.hp = 40;
		this.atk = 1;
		this.point = 10;
		this.itemNum = 1;
		this.itemType = "test";
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
		};
		break;
	}
};

var Item = function(_x, _y, _vx, _vy, _type) {
	this.id = "" + Math.random()　+ Date.now();
	this.x = _x;
	this.y = _y;
	this.vx = _vx;
	this.vy = _vy;
	this.type = _type;
	this.point = 0;
	this.counter = 0;

	switch(this.type) {
		case "test":
		var dx = (this.vx < 0) ? 0.01 : -0.01;
		var dy = (this.vy < 0) ? 0.01 : -0.01;
		this.point = 100;
		this.update = function() {
			this.vx = (Math.round(this.vx) === 0) ? 0 : (this.vx + dx);
			this.vy = (Math.round(this.vy) === 0) ? 0 : (this.vy + dy);
			this.x +=　this.vx;
			this.y += this.vy;
			this.counter++;
		};
		break;
	}
};

Item.prototype.update = function() {
	switch(this.type) {
		case "test":
		var dx = (this.vx < 0) ? 0.01 : -0.01;
		var dy = (this.vy < 0) ? 0.01 : -0.01;
		this.vx = (Math.round(this.vx) === 0) ? 0 : (this.vx + dx);
		this.vy = (Math.round(this.vy) === 0) ? 0 : (this.vy + dy);
		this.x +=　this.vx;
		this.y += this.vy;
		this.counter++;
		break;
	}
};

module.exports = {
	Player: Player,
	Enemy: Enemy,
	Item: Item
};