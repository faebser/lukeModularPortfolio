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
		luke.currentVector.pos.x = $("#menuContainer").offset().top + $("#menuContainer").outerHeight() / 2;
		luke.currentVector.pos.y = $("#menuContainer").offset().left + $("#menuContainer").outerWidth() / 2;
		console.log($("#menuContainer").offset().top);
		console.log(luke.currentVector.pos.y);
		luke.updateVector();
	},
	/**
	 * The update function is a meta-function and should set up
	 * the vars and describe the overall flow of the code when a new
	 * article is requested and needs to be positioned and displayed
	 */
	update: function () {
			var newArticle = luke.getNewArticle();
			var newPosX, newPosY;
			$('body').prepend(newArticle);
			newArticle.css({ display : "block", visibility : "hidden"});
			console.log((luke.currentVector.pos.x + newArticle.outerHeight() * luke.directionVector.pos.x) - newArticle.outerHeight() / 2);
			newPosX = (luke.currentVector.pos.x + newArticle.outerHeight() * luke.directionVector.pos.x) - newArticle.outerHeight() / 2;
			newPosY = (luke.currentVector.pos.y + newArticle.outerWidth() * luke.directionVector.pos.y) - newArticle.outerWidth() / 2;
			luke.updateVector();
			newArticle.css({ display : "none", visibility : "visible"});
			newArticle.css({ top : newPosX, left : newPosY }).fadeIn();
	},
	getNewArticle : function () {
		return luke.currentElement.clone();
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
	$('#menuMain').click(function(event) {
		event.preventDefault();
		luke.update();
	});
});
