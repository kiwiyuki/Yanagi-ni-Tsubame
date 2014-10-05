var SoundManager = function(volume) {
	var bgm = new Audio("");
	bgm.volume = volume;
	bgm.play;

	this.changeVolume = function(volume) {
		bgm.volume = volume;
	};
};