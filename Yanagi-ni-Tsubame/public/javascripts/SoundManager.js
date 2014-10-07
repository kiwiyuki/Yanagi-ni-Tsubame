var SoundManager = function(volume) {
	var myVolume = volume;

	var bgm = new Audio("resources/Cyber_World.mp3");
	bgm.loop = true;
	bgm.volume = myVolume;
	bgm.play();

	this.seShot = function() {
		playSE(seShot);
	};

	this.seHit = function() {
		playSE(seHit);
	};

	this.seEnemyBorn = function() {
		playSE(seEnemyBorn);
	};	

	this.changeVolume = function(volume) {
		myVolume = volume;
		bgm.volume = volume;
	};

	function playSE(seData) {
		if(myVolume > 0) {
			var sound = new Audio(seData);
			sound.volume = myVolume;
			sound.play();
		}
	};
};