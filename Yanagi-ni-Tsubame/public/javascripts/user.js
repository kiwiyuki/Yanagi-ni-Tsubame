(function(){
	$("#colorSlider").on("change" ,function() {
		var c =  "hsl("+ $(this).val() * 360 + ",100%,50%)";
		$("#color").css("color",c);
	});
	
})();