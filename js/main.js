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
			externalVector.pos.x += this.pos.x;
			externalVector.pos.y += this.pos.y;
		},
		add: function (externalVector) {
			this.pos.x += externalVector.pos.x; 
			this.pos.y += externalVector.pos.y;
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
	menuContainer : null,
	menuContainerX : null,
	menuContainerY : null,
	menuContainerWidth : null,
	menuContainerHeight : null,
	lastMousePos : { x : null, y : null },
	lastCssPos : { x : null, y : null },
	articleContent : null,
	articles : null,
	mapArticles : null,

	//vars for endless scrolling
	endlessScrollingVars : {
		origin : null, // the original p-element
		scrollHeight : null, // how much the user has to scroll down
		endlessArticle : null, // the parent
		originHeight: null
	},
	mapVars : {
		mapElement: null,
		heightRatio : null,
		widthRatio : null,
		offsetY : null,
		offsetX : null
	},

	/*
	 * The init function gets called after dom.ready and is used
	 * to setup all the vars for further coding pleasure.
	 */
	init : function () {
		luke.currentElement = $("#menuContainer");
		luke.currentVector.pos.x = $("#menuContainer").offset().left;
		luke.currentVector.pos.y = $("#menuContainer").offset().top;
		
		console.log(luke.currentVector.pos.x);
		luke.updateVector();
		luke.endlessScrolling();
		luke.menuContainer = $("#menuContainer");
		luke.menuContainerX = luke.currentVector.pos.x;
		luke.menuContainerY = luke.currentVector.pos.y;
		luke.menuContainerWidth = luke.menuContainer.outerWidth();
		luke.menuContainerHeight = luke.menuContainer.outerHeight();

		luke.articleContent = $("#articleContent");
		luke.articles = $('#articleContent article');

		luke.initMap();
		luke.updateMap();

		$('article.content').hover(luke.articleHoverZindexIn, luke.articleHoverZindexOut);
		$('#menuSub a').click(luke.subMenuClick);

		$(window).mousedown(luke.onMouseDown);
		$(window).mouseup(luke.onMouseUp);

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
	articleHoverZindexIn : function (event) {
		$(this).css({ "z-index" : 10 });
	},
	articleHoverZindexOut : function (event) {
		$(this).css({ "z-index" : "" });
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
	},
	returnMessyVector : function (articleHeight, articleWidth, margin) {
		// siehe skizze1
		// 0,0 = linke ecke von menu
		// alles darüber ist mit margin, menugrösse und article-grösse
		// margin wird immer entfernt/hinzugefügt
		// wenn value > 0 dann -articleHeight/Width
		// wenn value < 0 dann +menuHeight/Width
		var max = 0.2, min = -0.2,
		range = max + (min * -1),
		returnVector = new lukeVector( Math.random() * range - (range * 0.5), Math.random() * range - (range * 0.5) ),
		returnPos = { x : null, y : null };

		if(returnVector.pos.x > 0) {
			returnPos.x = luke.menuContainerX + ((returnVector.pos.x * articleWidth) + margin + luke.menuContainerWidth);
		}
		else {
			returnPos.x = luke.menuContainerX + ((returnVector.pos.x * articleWidth) - margin - articleWidth);
		}
		if(returnVector.pos.y > 0) {
			returnPos.y = luke.menuContainerY + ((returnVector.pos.y * articleHeight) + margin + luke.menuContainerHeight);
		}
		else {
			returnPos.y = luke.menuContainerY + ((returnVector.pos.y * articleHeight) - margin - articleHeight);
		}
		// console.log("X -> " + returnVector.pos.x);
		// console.log("articleWidth -> " + articleWidth);
		// console.log("menuContainerX -> " + luke.menuContainerX);
		// console.log("Y -> " + returnVector.pos.y);
		// console.log("articleHeight -> " + articleHeight);
		// console.log("menuContainerY -> " + luke.menuContainerY); 
		// console.log(returnPos);

		return returnPos;
	} ,
	firstClickMess : function () {
		// take all the articles and place them around the menu
		// define some margin around the menu
		// define some shadow class and tell luke about it
		// tell luke about how he has to organize his content
		var articles = $("article.content"),
		margin = 5;
		luke.articleContent.offset({ top : 0, left : 0 });
		// write a function where given the height and width of an element
		// and the size of the menu it responds with a random vector
		// positioned around the center and leave some space to
		// manipulate the order
		articles.each(function(index, element){
			var tempPos = luke.returnMessyVector($(element).outerHeight(), $(element).outerWidth(), margin);
			$(element).css({
				top : tempPos.y,
				left : tempPos.x
			});
		});
		articles.show();
		luke.updateMap();
	},
	onMouseDown : function (event) {
		luke.lastMousePos.x = event.pageX;
		luke.lastMousePos.y = event.pageY;
		luke.lastCssPos.x = luke.articleContent.offset().left;
		luke.lastCssPos.y = luke.articleContent.offset().top;
		$(window).mousemove(luke.mouseMove);
	},
	onMouseUp : function (event) {
		$(window).unbind("mousemove", luke.mouseMove);
		luke.updateMap();
	},
	mouseMove : function (event) {
		luke.articleContent.offset({top : luke.lastCssPos.y + (event.pageY - luke.lastMousePos.y), left : luke.lastCssPos.x + (event.pageX - luke.lastMousePos.x) });
	},
	rightArticlesOrder : function (articles) {
		var offset = luke.menuContainer.offset(),
		tempVec = new lukeVector(offset.left + 200, offset.top - 50),
		movement = new lukeVector(20, 20);
		$(articles).each(function (index, element) {
			$(element).offset( {top : tempVec.pos.y, left : tempVec.pos.x} );
			tempVec.add(movement);
		});
	},
	wrongArticlesMess : function (articles) {
		var offset = luke.menuContainer.offset(),
		tempVec = new lukeVector(offset.left - 600, offset.top - 50),
		max = 100, min = -100,
		range = max + (min * -1),
		movement = new lukeVector( Math.random() * range - (range * 0.5), Math.random() * range - (range * 0.5) );
		$(articles).each(function (index, element) {
			$(element).offset( {top : tempVec.pos.y, left : tempVec.pos.x} );
			movement.set( Math.random() * range - (range * 0.5), Math.random() * range - (range * 0.5) );
			tempVec.add(movement);
		});
	},
	subMenuClick : function (event) {
		event.preventDefault();
		var rightArticles = $('article.content.' + $(this).attr("href").substring(1)),
		wrongArticles = $('article.content').not("." +  $(this).attr("href").substring(1));
		luke.wrongArticlesMess(wrongArticles);
		luke.rightArticlesOrder(rightArticles);
		luke.updateMap();
	},
	initMap : function () {
		luke.mapVars.heightRatio = 10;
		luke.mapVars.widthRatio = 10;
		luke.mapVars.offsetX = 400 / luke.mapVars.widthRatio;
		luke.mapVars.offsetY = 400 / luke.mapVars.heightRatio;
		luke.map = Raphael("map", 1000, 1000);
		luke.articles.each(function (index, element) {
			console.log($(element).css("backgroundColor"));
			luke.map.rect(1, 1, 1, 1).attr("fill", Raphael.color($(element).css("backgroundColor"))).attr("stroke", "1px black");
		});
		luke.map.rect(luke.menuContainer.offset().left / luke.mapVars.widthRatio + luke.mapVars.offsetX, luke.menuContainer.offset().top / luke.mapVars.widthRatio + luke.mapVars.offsetY,
			luke.menuContainer.outerWidth() / luke.mapVars.widthRatio, luke.menuContainer.outerHeight() / luke.mapVars.heightRatio
			).attr("fill", Raphael.color(luke.menuContainer.css("backgroundColor"))).attr("stroke", "none");
	},
	updateMap : function () {
		luke.articles.each(function (index, element) {
			var offset = $(element).offset();
			if($(element).css("display") !== "none") {
				luke.map.getById(index).attr({ 
					x : offset.left / luke.mapVars.widthRatio + luke.mapVars.offsetX,
					y : offset.top / luke.mapVars.heightRatio + luke.mapVars.offsetY,
					width : $(element).outerWidth() / luke.mapVars.widthRatio,
					height : $(element).outerHeight() / luke.mapVars.heightRatio
				});
			}
		});
	}
};

$(document).ready(function () {
	luke.init();
	$('#menuMain').click(function(event) {
		event.preventDefault();
		luke.firstClickMess();
	});
});