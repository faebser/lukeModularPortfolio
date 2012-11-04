/* 
	this a small vector class used to to describe where to place the next
	article in luke's page. Works with relative values because the
	articles all have a different size. Range of pos.x and pos.y
	is from -0.5 to 0.5. 
*/
function lukeVector(inputX, inputY) {
	"use strict";
	return {
		mag : null,
		pos : {
			x : inputX,
			y : inputY
		},
		magIt : function () {
			if (this.pos.x !== 0 && this.pos.y !== 0) {
				this.mag = Math.sqrt(this.pos.x * this.pos.x + this.pos.y * this.pos.y);
			}
		},
		normalize : function () {
			if (null === typeof this.mag) {
				this.magIt();
			}
			this.pos.x = this.pos.x / this.mag;
			this.pos.y = this.pos.y / this.mag;
		},
		addTo: function(externalVector) {
			if(object === typeof externalVector) {
				externalVector.pos.x += this.pos.x;
				externalVector.pos.y += this.pos.y;
			}
			else {
				return false;
			}
		},
		add: function (externalVector) {
			if(object === typeof externalVector) {
				this.pos.x += externalVector.pos.x; 
				this.pos.y += externalVector.pos.y; 
			}
			else {
				return false;
			}
		},
		set: function (externalX, externalY) {
			this.pos.x = externalX;
			this.pos.y = externalY;
		}
	};
}


var luke = {

	directionVector : new lukeVector(0, 0),
	currentElementIndex : 0,
	currentElement : null,
	currentVector : new lukeVector(0, 0),

	/*
	 * The init function gets called after dom.ready and is used
	 * to setup all the vars for further coding pleasure.
	 */
	init : function () {
		luke.currentElement = $('#' + luke.currentElementIndex);
		luke.currentVector.pos.x = luke.currentElement.offset().top + luke.currentElement.height() / 2;
		luke.currentVector.pos.y = luke.currentElement.offset().left + luke.currentElement.height() / 2;
		luke.updateVector();
	},
	/**
	 * The update function is a meta-function and should set up
	 * the vars and describe the overall flow of the code when a new
	 * article is requested and needs to be positioned and displayed
	 */
	update: function () {
			
	},
	/** 
	 * The nextRound function is where the fukkking work is done.
	 * comparing vectors and shit, doing some super fanzzzy math with
	 * my own farcking vector-object and shit. have fun reading my code
	 * bastard.
	 */
	nextRound : function () {

	},
	updateVector : function() {
		var y = Math.random() - 0.5;
		var x = Math.random() - 0.5;
		luke.directionVector.set(x, y);
		console.log(luke.directionVector.pos.x);
		console.log(luke.directionVector.pos.y);
	}
};
/*
 * Konzept muss umgeacht werden, mouse.AltePosition -> mouse.neuePosition gibt
 * Vektor, dieser Vektor kann dann modifziert werden durch begrenzung oder zufällige
 * Einflüsse.
 */

$(document).ready(function () {
	luke.init();

	var lastPos = { x : 0, y : 0 },
		it = 0,
		windowWidth = $(window).width(),
		windowHeight = $(window).height(),
		halfWindowWith = windowWidth * 0.5;
	$('#menuMain').click(function(event) {
		event.preventDefault();
		//var elementOffset = $(this).offset();
		var mouse = {x : event.clientX, y : event.clientY},
			newArt = $('article#test').clone(),
			newPos = { x : null, y : null};
		console.log(event);
		
		newArt.attr('id', it);
		newArt.attr('z-index', it++);
		if(lastPos.x == 0 && lastPos.y == 0) {
			console.log("0");
			newPos.x = mouse.x + newArt.outerWidth();
			newPos.y = mouse.y;
		}
		else {
			if(mouse.x + newArt.outerWidth() > windowWidth) {
				newPos.x = lastPos.x - (windowWidth - mouse.x);
			}
			else {
				newPos.x = lastPos.x + mouse.x;
			}
			if(mouse.y + newArt.outerHeight() > windowHeight) {
				newPos.y = lastPos.y - (windowHeight - mouse.y);
			}
			else {
				newPos.y = lastPos.y + mouse.y;
			}
		}
		$('body').prepend(newArt);
		lastPos = newPos;
		newArt.css({ top : newPos.y, left : newPos.x});
		newArt.show();
	});
});
