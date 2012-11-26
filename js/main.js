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

	//vars for endless scrolling
	endlessScrollingVars : {
		origin : null, // the original p-element
		scrollHeight : null, // how much the user has to scroll down
		endlessArticle : null, // the parent
		originHeight: null
	},

	/*
	 * The init function gets called after dom.ready and is used
	 * to setup all the vars for further coding pleasure.
	 */
	init : function () {
		luke.currentElement = $("#menuContainer");
		luke.currentVector.pos.x = $("#menuContainer").offset().left;
		luke.currentVector.pos.y = $("#menuContainer").offset().top;
		console.log($("#menuContainer").offset().top);
		console.log(luke.currentVector.pos.x);
		luke.updateVector();
		luke.endlessScrolling();
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
			if(luke.directionVector.pos.y === -1) {
				newPosY = luke.currentVector.pos.y + newArticle.outerHeight() * luke.directionVector.pos.y;
			}
			else if(luke.directionVector.pos.y === 1) {
				newPosY = luke.currentVector.pos.y + luke.currentElement.outerHeight() * luke.directionVector.pos.y;
			}
			else if(luke.directionVector.pos.y === 0) {
				newPosY = 0;
			}
			if(luke.directionVector.pos.x >= 0) {
				newPosX = luke.currentVector.pos.x + luke.currentElement.outerWidth() * luke.directionVector.pos.x;
			}
			else if (luke.directionVector.pos.x < 0) {
				newPosX = luke.currentVector.pos.x + newArticle.outerWidth() * luke.directionVector.pos.x;
			};
			console.log("abstand y = " + (newPosY - luke.currentVector.pos.y));
			console.log("abstand x = " + (newPosX - luke.currentVector.pos.x));
			luke.updateVector();
			newArticle.css({ display : "none", visibility : "visible"});
			newArticle.css({ top : newPosY, left : newPosX }).fadeIn();
	},
	getNewArticle : function () {
		return $("#"+luke.currentElementIndex).clone();
	},
	updateVector : function() {
		var x = (Math.random() * 2) - 1;
		var y = Math.random();
		if(x === -1) {
			y *= 0.5;
		}
		else if(x > -1 && x < 1) {
			y = 0;
			while (y === 0) {
				y = Math.floor(Math.random() * 3) - 1;
			}
		}
		else if(x === 1) {
			y = (y * 0.5) + 0.5; 
		}
		console.log( "x = " + x);
		console.log( "y = " + y);
		luke.directionVector.set(x, y);
	},
	endlessScrolling : function () {
		// set up vars and attach eventhandler for endless scrolling
		var vars = luke.endlessScrollingVars;

		vars.endlessArticle = $("#endlessText");
		vars.origin = vars.endlessArticle.find("#origin");
		vars.originHeight = vars.origin.outerHeight() - vars.endlessArticle.outerHeight();
		vars.scrollHeight = vars.originHeight;

		vars.endlessArticle.scroll(function() {
			if($(this).scrollTop() >= vars.scrollHeight) {
				$(this).append(vars.origin.clone().attr("id", ''));
				vars.scrollHeight = ($(this).find("p").length * vars.originHeight);
			}
		});
	}
};
/*
 * Konzept muss umgedacht werden, mouse.AltePosition -> mouse.neuePosition gibt
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
