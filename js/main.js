$(document).ready(function() {
	var article = $('article');
	var lastPos = { x : 0, y : 0 };
	var it = 0;
	$('#menuMain').click(function(event) {
		event.preventDefault();
		var newArt = $('article#test').clone();
		newArt.attr('id', it++);
		$('body').append(newArt);
		var newPos = { x : lastPos.x + newArt.width(), y : lastPos.y + newArt.height()};
		lastPos = newPos;
		newArt.css({ top : newPos.x, left : newPos.y});
		newArt.show();
	});
});
