var Player = function(_id, _x, _y, _hp, _score, _color) {
	this.id = _id;
	this.x = _x;
	this.y = _y;
	this.bullets = [];
	this.hp = _hp;
	this.score = _score;
	this.state = "WAIT";
	this.color = _color;
};

var Enemy = function(_x, _y, _type) {
	this.id = generateID();
	this.x = _x;
	this.y = _y;
	this.type = _type;
	this.hp = 0;
	this.atk = 0;
	this.point = 0;
	this.counter = 0;

	this.individualUpdate = function(self) {};
	this.update = function() {
		this.individualUpdate(this);

		// 発生から1分で自動的に死ぬ
		this.counter++;
		if(this.counter > 3600) {
			this.hp = 0;
		}
	}

	switch(this.type) {
		// ヤナギニツバメ零号機
		case 'test':
		this.hp = 40;
		this.atk = 1;
		this.point = 10;
		this.itemNum = 5;
		this.itemType = "exp";
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

		case 'akatan':
		this.hp = 60;
		this.atk = 30;
		this.point = 10;
		this.itemNum = 3;
		this.itemType = "exp"
		break;

		case 'aotan':
		this.hp = 80;
		this.atk = 30;
		this.point = 10;
		this.itemNum = 3;
		this.itemType = "exp"
		break;
	}
};

var Item = function(_x, _y, _vx, _vy, _type) {
	this.id = generateID();
	this.x = _x;
	this.y = _y;
	this.vx = _vx;
	this.vy = _vy;
	this.type = _type;
	this.point = 0;
	this.counter = 0;

	switch(this.type) {
		case "exp":
		this.point = 10;
		break;
	}
};

Item.prototype.update = function() {
	switch(this.type) {
		case "exp":
		var dx = (this.vx < 0) ? 0.1 : -0.1;
		var dy = (this.vy < 0) ? 0.1 : -0.1;
		this.vx = (Math.round(this.vx) === 0) ? 0 : (this.vx + dx);
		this.vy = (Math.round(this.vy) === 0) ? 0 : (this.vy + dy);
		this.x = this.x + Math.round(this.vx);
		this.y = this.y + Math.round(this.vy); 
		this.counter++;
		break;
	}
};

function generateID() {
	var dateNow = Date.now().toString();
	var id = (dateNow.substring(dateNow.length - 7) + (Math.random() * 10000)) | 0;
	return id.toString(16);
}

module.exports = {
	Player: Player,
	Enemy: Enemy,
	Item: Item
};