var SoundManager = function(volume) {
	var bgm = new Audio("resources/Cyber_World.mp3");
	bgm.loop = true;
	bgm.volume = volume;
	bgm.play();

	this.changeVolume = function(volume) {
		bgm.volume = volume;
	};
};