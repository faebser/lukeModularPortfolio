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
		subtract: function (externalVector) {
			this.pos.x -= externalVector.pos.x;
			this.pos.y -= externalVector.pos.y;
		},
		set: function (externalX, externalY) {
			this.pos.x = externalX;
			this.pos.y = externalY;
		},
		setFromVector: function (externalVector) {
			this.pos.x = externalVector.pos.x;
			this.pos.y = externalVector.pos.y;
		},
		addY : function (y) {
			this.pos.y += y;
		},
		addX : function (x) {
			this.pos.x += x;
		},
		setX : function (x) {
			this.pos.x = x;
		},
		setY : function (y) {
			this.pos.y = y;
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
	lastMenuPos : { x : null, y : null },
	articleContent : null,
	articles : null,
	boxesContent : null,
	boxes: null,
	mapArticles : null,
	scroller : null,
	info : null,

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
		luke.menuContainer = $("#menuContainer");
		luke.menuContainer.css({top: $(window).height() * 0.5 - luke.menuContainer.outerHeight() * 0.5 ,left: $(window).width() * 0.5 - luke.menuContainer.outerWidth() * 0.5});
		luke.currentElement = $("#menuContainer");
		luke.currentVector.pos.x = $("#menuContainer").offset().left;
		luke.currentVector.pos.y = $("#menuContainer").offset().top;
		
		luke.updateVector();
		luke.endlessScrolling();
		luke.menuContainerX = luke.currentVector.pos.x;
		luke.menuContainerY = luke.currentVector.pos.y;
		luke.menuContainerWidth = luke.menuContainer.outerWidth();
		luke.menuContainerHeight = luke.menuContainer.outerHeight();

		luke.articleContent = $("#articleContent");
		luke.articles = $('#articleContent article');

		luke.articles.each(function (index, element) {
			var max = 7, min = 1,
			range = max - min,
			shadow = Math.ceil(Math.random() * range),
			color = Math.ceil(Math.random() * range);
			$(element).addClass("backGroundColor-" + color).addClass("boxShadow-" + shadow);
			if($(element).attr("id") === undefined) {
				$(element).attr("id", Math.random() * 1000);
			}
		});

		luke.boxesContent = $('#specialBoxes');
		luke.boxes = $('#specialBoxes article');

		luke.boxes.each(function (index, element) {
			var max = 7, min = 1,
			range = max - min,
			shadow = Math.ceil(Math.random() * range),
			color = Math.ceil(Math.random() * range);
			$(element).addClass("backGroundColor-" + color).addClass("boxShadow-" + shadow);
		});

		luke.info = $("#info");

		luke.initMap();
		luke.info.css({
			left : luke.map.getById("menuContainer").attr("x"),
			top : luke.menuContainer.offset().top * 0.5
		});
		luke.updateMap();

		$('#menuMain li a').click(luke.mainMenuClick);

		$('article a').click(function(event) {
			if($(this).attr("href").indexOf("#") == 0) {
				var offset = $(this).offset();
				luke.displayOneArticle($(this).attr("href").substring(1), offset.left + $(this).outerWidth(), offset.top);
			}
			
		});

		luke.menuContainer.hover(luke.articleHoverZindexIn, luke.articleHoverZindexOut);
		$('article').hover(luke.articleHoverZindexIn, luke.articleHoverZindexOut);
		$('#menuSub a').click(luke.subMenuClick);

		luke.scroller = $("#scroller");
		luke.scroller.mousedown(luke.onMouseDown);
		luke.scroller.mouseup(luke.onMouseUp);

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
	},
	firstClickMess : function () {
		// take all the articles and place them around the menu
		// define some margin around the menu
		// define some shadow class and tell luke about it
		// tell luke about how he has to organize his content
		var articles = $("#articleContent article"),
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
		luke.lastMenuPos.x = luke.menuContainer.offset().left;
		luke.lastMenuPos.y = luke.menuContainer.offset().top;
		luke.scroller.css("zIndex", 10000);
		$(window).mousemove(luke.mouseMove);
	},
	onMouseUp : function (event) {
		luke.scroller.css("zIndex", "");
		$(window).unbind("mousemove", luke.mouseMove);
		// luke.updateMap();

	},
	mouseMove : function (event) {
		luke.menuContainerX = luke.menuContainer.offset().left;
		luke.menuContainerY = luke.menuContainer.offset().top;
		luke.menuContainer.offset({top : luke.lastMenuPos.y + (event.pageY - luke.lastMousePos.y), left : luke.lastMenuPos.x + (event.pageX - luke.lastMousePos.x) });
		luke.articleContent.offset({top : luke.lastCssPos.y + (event.pageY - luke.lastMousePos.y), left : luke.lastCssPos.x + (event.pageX - luke.lastMousePos.x) });
		luke.boxesContent.offset({top : luke.lastCssPos.y + (event.pageY - luke.lastMousePos.y), left : luke.lastCssPos.x + (event.pageX - luke.lastMousePos.x) });
	},
	rightArticlesOrder : function (articles, clickedLinkOffsetTop) {
		if(articles.length != 0) {
			var offset = luke.menuContainer.offset(),
			startVec = new lukeVector(offset.left - 417, clickedLinkOffsetTop),
			tempVec = new lukeVector(startVec.pos.x, startVec.pos.y),
			max = { x : -20, y : 35},
			min = {x : 2, y : 10},
			range = {
				x : max.x - min.x,
				y : max.y - min.y
			},
			halfRange = {
				x : range.x * 0.5,
				y : range.y * 0.5
			},
			movement = new lukeVector(Math.random() * range.x + halfRange.x, Math.random() * range.y),
			amountPerColumn = 3;

			console.log(movement);

			for(var i = 6; i >= 2; i--) {
				if(articles.length % i === 0 && articles.length != i) {
					amountPerColumn = i;
					break;
				}
			}

			var size = $(articles[0]).outerWidth();

			$(articles).each(function (index, element) {
				cur = $(element);
				cur.offset( {top : tempVec.pos.y, left : tempVec.pos.x} );
				movement.set(Math.random() * range.x + halfRange.x, cur.outerHeight() + Math.random() * range.y);
				console.log(movement.pos.x + " <-x , y -> " + movement.pos.y);
				console.log("--");
				tempVec.add(movement);
				if(amountPerColumn % index === 0) {
					startVec.addX(-400 + movement.pos.x);
					tempVec.set(startVec.pos.x, startVec.pos.y);
					size = 0;
				}
			});
		}
	},
	wrongArticlesMess : function (articles) {
		var offset = luke.menuContainer.offset(),
		startVec = new lukeVector(offset.left + 550, offset.top - 100),
		tempVec = new lukeVector(startVec.pos.x, startVec.pos.y),
		max = 300, min = -300,
		range = max + (min * -1),
		movement = new lukeVector( Math.random() * range - (range * 0.5), Math.random() * range - (range * 0.5) );

		$(articles).each(function (index, element) {
			movement.set( Math.random() * range - (range * 0.5), Math.random() * range - (range * 0.5) );
			tempVec.setFromVector(startVec);
			tempVec.add(movement);
			$(element).offset( {top : tempVec.pos.y, left : tempVec.pos.x} );
		});
	},
	subMenuClick : function (event) {
		event.preventDefault();
		var rightArticles = luke.articleContent.find('article.' + $(this).attr("href").substring(1)),
		wrongArticles = luke.articleContent.find('article').not("." +  $(this).attr("href").substring(1));
		luke.wrongArticlesMess(wrongArticles);
		luke.rightArticlesOrder(rightArticles, $(this).offset().top);
		luke.articles.show();
		// if(!luke.articleContent.hasClass("showing")) {
		// 	
		// 	luke.articleContent.addClass("showing");
		// }
		luke.updateMap();
	},
	mainMenuClick : function (event) {
		$("article").hide();
		var offset = luke.menuContainer.offset();
		luke.displayOneArticle($(this).attr("href").substring(1), offset.left + luke.menuContainer.outerWidth(), offset.top);
	},
	// posX and posY are top left corner of the article
	displayOneArticle : function (id, posX, posY) {
		var article = luke.boxesContent.find("#" + id),
		max = { x : 100, y : 100},
		min = {x : 10, y : -100},
		range = {
			x : max.x - min.x,
			y : max.y + (min.y * -1)
		},
		halfRange = {
			x : range.x * 0.5,
			y : range.y * 0.5
		};
		console.log(article);
		if(article.length == 0) {
			article = luke.articleContent.find("#" + id);
		}
		if(article.length == 0) {
			console.error("found no article neither in luke.boxes nor in luke.articles");
		}

		console.log("input x: " + posX);
		console.log("input y: " + posY);

		var origin = new lukeVector(posX, posY),
		movement = new lukeVector( Math.random() * range.x - halfRange.x, Math.random() * range.y - halfRange.y );
		origin.add(movement);
		console.log("origin.x: " + origin.pos.x);
		console.log("origin.y: " +  origin.pos.y);
		article.css({
			top: origin.pos.y,
			left: origin.pos.x,
			display: "block"
		});
	},
	initMap : function () {
		luke.mapVars.heightRatio = 10;
		luke.mapVars.widthRatio = 10;
		luke.mapVars.offsetX = 400 / luke.mapVars.widthRatio;
		luke.mapVars.offsetY = 400 / luke.mapVars.heightRatio;
		luke.map = Raphael("map", 1000, 1000);
		luke.articles.each(function (index, element) {
			// console.log("backGroundColor in map.init: " + $(element).css("backgroundColor"));
			luke.map.rect(1, 1, 1, 1).attr("fill", Raphael.color($(element).css("backgroundColor"))).attr("stroke", "none").id = $(element).attr("id");
		});
		luke.map.rect(luke.menuContainer.offset().left / luke.mapVars.widthRatio + luke.mapVars.offsetX, luke.menuContainer.offset().top / luke.mapVars.widthRatio + luke.mapVars.offsetY,
			luke.menuContainer.outerWidth() / luke.mapVars.widthRatio, luke.menuContainer.outerHeight() / luke.mapVars.heightRatio
			).attr("fill", Raphael.color(luke.menuContainer.css("backgroundColor"))).attr("stroke", "none").id = luke.menuContainer.attr("id");
	},
	// all in mappixels
	updateMap : function () {
		var menuOffset = luke.menuContainer.offset(),
		menuMapPos = luke.map.getById("menuContainer").attr(["x", "y"]),
		elementIndex = 0;
		luke.articles.each(function (index, element) {
			if($(element).css("display") !== "none") {
				var offset = $(element).offset(),
				pos = { 
					x : menuMapPos.x + ((offset.left - menuOffset.left) / luke.mapVars.widthRatio),
					y : menuMapPos.y + ((offset.top - menuOffset.top) / luke.mapVars.heightRatio)
				};
				
				luke.map.getById($(element).attr("id")).attr({ 
					x : pos.x,
					y : pos.y,
					width : $(element).outerWidth() / luke.mapVars.widthRatio,
					height : $(element).outerHeight() / luke.mapVars.heightRatio
				});
			}
			elementIndex = index;
		});
	}
};

$(document).ready(function () {
	luke.init();
});