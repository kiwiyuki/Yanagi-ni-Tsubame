var SoundManager = function(volume) {
	var gameVolume = volume;

	var bgm = new Audio("resources/Cyber_World.mp3");
	bgm.loop = true;
	bgm.volume = gameVolume;
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

	function playSE(seData) {
		if(gameVolume > 0) {
			var sound = new Audio(seData);
			sound.volume = gameVolume;
			sound.play();
		}
	}

	// イベント追加
	$('#gameVolume').click(onClickVolumeIcon);

	function onClickVolumeIcon() {
		if(gameVolume <= 0) {
			gameVolume = 0.5;
			$('#gameVolume i').removeClass("fa-volume-off");
			$('#gameVolume i').addClass("fa-volume-down");
		} else if (gameVolume < 1.0) {
			gameVolume = 1.0;
			$('#gameVolume i').removeClass("fa-volume-down");
			$('#gameVolume i').addClass("fa-volume-up");
		} else if (gameVolume >= 1.0) {
			gameVolume = 0;
			$('#gameVolume i').removeClass("fa-volume-up");
			$('#gameVolume i').addClass("fa-volume-off");
		}
		
		bgm.volume = gameVolume;
	}
};