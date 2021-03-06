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
	videoList : new Array(),

	//vars for endless scrolling
	scrollingVars : {
		origin : null, // the original p-element
		endlessArticle : null, // the parent
		onTotalScrollOffset : 150
	},
	mapVars : {
		mapElement: null,
		heightRatio : null,
		widthRatio : null,
		offsetY : null,
		offsetX : null
	},
	templates : {
		video : null,
		source : null,
		audio: null
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
		luke.menuContainerX = luke.currentVector.pos.x;
		luke.menuContainerY = luke.currentVector.pos.y;
		luke.menuContainerWidth = luke.menuContainer.outerWidth();
		luke.menuContainerHeight = luke.menuContainer.outerHeight();

		luke.articleContent = $("#articleContent");
		luke.articles = $('#articleContent article');

		var tempString = $("#statement p").html();
		luke.scrollingVars.origin = " " + tempString.charAt(0).toLowerCase() + tempString.slice(1);
		luke.scrollingVars.endlessText = $("#statement p");

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
			top : luke.map.getById("menuContainer").attr("y") + 140
		});
		luke.updateMap();

		$('#menuMain li a').click(luke.mainMenuClick);

		$('article a').click(function(event) {
			if($(this).attr("href").indexOf("#") == 0) {
				event.preventDefault();
				var offset = $(this).offset();
				luke.displayOneArticle($(this).attr("href").substring(1), offset.left + $(this).outerWidth(), offset.top);
				luke.updateMap();
			}
		});

		luke.menuContainer.hover(luke.articleHoverZindexIn, luke.articleHoverZindexOut);
		$('article').hover(luke.articleHoverZindexIn, luke.articleHoverZindexOut);
		$('#menuSub a').click(luke.subMenuClick);

		luke.templates.video = $('#templates video');
		luke.templates.source = $("#templates source");
		luke.templates.audio = $('#templates audio');
		$("div.video, div.audio").each(luke.videoLoader);

		luke.scroller = $("#scroller");
		luke.scroller.onselectstart = function() { return false; };
		luke.scroller.mousedown(luke.onMouseDown);
		luke.scroller.mouseup(luke.onMouseUp);
		$(window).mouseleave(luke.onMouseLeaveWindow);

	},
	onMouseLeaveWindow : function (event) {
		if(luke.scroller.hasClass("inFront")) {
				luke.onMouseUp(event);				
			}
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
		luke.scrollingVars.endlessText.append(luke.scrollingVars.origin);
		$('#statement').mCustomScrollbar("update");
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
		event.preventDefault();
		luke.lastMousePos.x = event.pageX;
		luke.lastMousePos.y = event.pageY;
		luke.lastCssPos.x = luke.articleContent.offset().left;
		luke.lastCssPos.y = luke.articleContent.offset().top;
		luke.lastMenuPos.x = luke.menuContainer.offset().left;
		luke.lastMenuPos.y = luke.menuContainer.offset().top;
		luke.scroller.css("zIndex", 10000);
		luke.scroller.addClass("inFront");
		$(window).mousemove(luke.mouseMove);
	},
	onMouseUp : function (event) {
		event.preventDefault();
		luke.scroller.css("zIndex", "");
		luke.scroller.removeClass("inFront");
		$(window).unbind("mousemove", luke.mouseMove);
		// luke.updateMap();

	},
	mouseMove : function (event) {
		event.preventDefault();
		luke.menuContainerX = luke.menuContainer.offset().left;
		luke.menuContainerY = luke.menuContainer.offset().top;
		luke.menuContainer.offset({top : luke.lastMenuPos.y + (event.pageY - luke.lastMousePos.y), left : luke.lastMenuPos.x + (event.pageX - luke.lastMousePos.x) });
		luke.articleContent.offset({top : luke.lastCssPos.y + (event.pageY - luke.lastMousePos.y), left : luke.lastCssPos.x + (event.pageX - luke.lastMousePos.x) });
		luke.boxesContent.offset({top : luke.lastCssPos.y + (event.pageY - luke.lastMousePos.y), left : luke.lastCssPos.x + (event.pageX - luke.lastMousePos.x) });
	},
	rightArticlesOrder : function (articles, clickedLinkOffsetTop) {
		if(articles.length != 0) {
			var offset = luke.menuContainer.offset();
			offset.left = offset.left - luke.articleContent.offset().left;
			clickedLinkOffsetTop = clickedLinkOffsetTop - luke.articleContent.offset().top;

			var startVec = new lukeVector(offset.left - 430, clickedLinkOffsetTop),
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
			columnYRange = {
				max : 29,
				min: 12
			},
			movement = new lukeVector(Math.random() * range.x + halfRange.x, Math.random() * range.y),
			amountPerColumn = 3;
			columnYRange.range = columnYRange.max - columnYRange.min;

			for(var i = 6; i >= 2; i--) {
				if(articles.length % i === 0 && articles.length != i) {
					amountPerColumn = i;
					break;
				}
			}

			var size = $(articles[0]).outerWidth();

			$(articles).each(function (index, element) {
				cur = $(element);
				cur.css( {top : tempVec.pos.y, left : tempVec.pos.x} );
				movement.set(Math.random() * range.x + halfRange.x, cur.outerHeight() + Math.random() * range.y + min.y);
				tempVec.add(movement);
				if(amountPerColumn % index === 0) {
					startVec.addX(-400 - (Math.random() * columnYRange.range + columnYRange.min));
					tempVec.set(startVec.pos.x, startVec.pos.y);
					size = 0;
				}
			});
		}
	},
	currentView : function (articles, clickedLinkOffsetTop) {
		if(articles.length != 0) {
			var offset = luke.menuContainer.offset();
			offset.left = offset.left - luke.articleContent.offset().left;
			clickedLinkOffsetTop = clickedLinkOffsetTop - luke.articleContent.offset().top;

			var startVec = new lukeVector(offset.left + luke.menuContainer.outerWidth() + 30, clickedLinkOffsetTop),
			tempVec = new lukeVector(startVec.pos.x, startVec.pos.y),
			max = { x : 20, y : 35},
			min = {x : 2, y : 10},
			range = {
				x : max.x - min.x,
				y : max.y - min.y
			},
			halfRange = {
				x : range.x * 0.5,
				y : range.y * 0.5
			},
			columnYRange = {
				max : 29,
				min: 12
			},
			movement = new lukeVector(Math.random() * range.x + halfRange.x, Math.random() * range.y),
			amountPerColumn = 3;
			columnYRange.range = columnYRange.max - columnYRange.min;

			articles.css({
				top: 0,
				left: 0
			});

			for(var i = 6; i >= 2; i--) {
				if(articles.length % i === 0 && articles.length != i) {
					amountPerColumn = i;
					break;
				}
			}

			$(articles).each(function (index, element) {
				cur = $(element);
				cur.offset({
					top : tempVec.pos.y,
					left : tempVec.pos.x
				});
				movement.set(Math.random() * range.x + halfRange.x, cur.outerHeight() + (Math.random() * range.y + min.y));
				tempVec.add(movement);
				if(amountPerColumn % index === 0) {
					startVec.addX(400 + (Math.random() * columnYRange.range + columnYRange.min));
					tempVec.set(startVec.pos.x, startVec.pos.y);
					size = 0;
				}
			});
			articles.show();
		}
	},
	wrongArticlesMess : function (articles) {
		var offset = luke.menuContainer.offset();
			offset.left = offset.left - luke.articleContent.offset().left;
			offset.top = offset.top - luke.articleContent.offset().top;

		var startVec = new lukeVector(offset.left + 450, offset.top - 100),
		tempVec = new lukeVector(startVec.pos.x, startVec.pos.y),
		max = 199, min = -199,
		range = max + (min * -1),
		movement = new lukeVector( Math.random() * range - (range * 0.5), Math.random() * range - (range * 0.5) );

		$(articles).each(function (index, element) {
			movement.set( Math.random() * range - (range * 0.5), Math.random() * range - (range * 0.5) );
			tempVec.setFromVector(startVec);
			tempVec.add(movement);
			$(element).css( {top : tempVec.pos.y, left : tempVec.pos.x} );
		});
	},
	subMenuClick : function (event, classy, offset) {
		if( typeof classy == "undefined" ) {
			classy = $(this).attr("href").substring(1);
		}
		if( typeof offset == "undefined" ) {
			offset = $(this).offset().top;
		}
		event.preventDefault();
		var rightArticles = luke.articleContent.find('article.' + classy),
		wrongArticles = luke.articleContent.find('article').not("." +  classy);
		luke.rightArticlesOrder(rightArticles, offset);
		rightArticles.show();
		wrongArticles.hide();
		luke.boxes.hide();
		luke.updateMap();
	},
	mainMenuClick : function (event) {
		event.preventDefault();
		luke.articles.hide();
		luke.boxes.hide();
		var offset = luke.menuContainer.offset(),
			href = $(this).attr("href").substring(1);

		offset.left = offset.left - (luke.articleContent.offset().left);
		offset.top = offset.top - (luke.articleContent.offset().top);
		if(href != "current") {
			luke.displayOneArticle($(this).attr("href").substring(1), offset.left + luke.menuContainer.outerWidth(), offset.top);
		}
		else if(href == "current") {
			luke.currentView(luke.articleContent.find(".current"), $(this).offset().top);
		}
		if(href == "statement") {
			if(!$('#statement').hasClass("scroll")) {
				$("#statement").mCustomScrollbar({
					callbacks:{
						onTotalScroll : function() {
							luke.endlessScrolling();
						},
						onTotalScrollOffset : luke.scrollingVars.onTotalScrollOffset
					}
				}).addClass("scroll");
			}
		}
		luke.updateMap();
	},
	// posX and posY are top left corner of the article
	displayOneArticle : function (id, posX, posY) {
		var theThing = $("#" + id),
		max = { x : 100, y : 100},
		min = {x : 10, y : 0},
		range = {
			x : max.x - min.x,
			y : max.y + (min.y * -1)
		},
		halfRange = {
			x : range.x * 0.5,
			y : range.y * 0.5
		};
		if(theThing.length == 0) {
			theThing = luke.articleContent.find("#" + id);
		}
		if(theThing.length == 0) {
			console.error("found no article neither in luke.boxes nor in luke.articles");
		}

		var origin = new lukeVector(posX, posY),
		movement = new lukeVector( Math.random() * range.x + min.x, Math.random() * range.y + min.y );

		origin.add(movement);

		theThing.css({
			top:  origin.pos.y,
			left: origin.pos.x
		});
		theThing.show();
		
	},
	initMap : function () {
		luke.mapVars.heightRatio = 10;
		luke.mapVars.widthRatio = 10;
		luke.mapVars.offsetX = 1400 / luke.mapVars.widthRatio;
		luke.mapVars.offsetY = 800 / luke.mapVars.heightRatio;
		luke.map = Raphael("map", 1000, 1000);
		luke.articles.each(function (index, element) {
			// console.log("backGroundColor in map.init: " + $(element).css("backgroundColor"));
			luke.map.rect(1, 1, 0, 0).attr("fill", Raphael.color($(element).css("backgroundColor"))).attr("stroke", "none").id = $(element).attr("id");
		});
		luke.boxes.each(function (index, element) {
			// console.log("backGroundColor in map.init: " + $(element).css("backgroundColor"));
			luke.map.rect(1, 1, 0, 0).attr("fill", Raphael.color($(element).css("backgroundColor"))).attr("stroke", "none").id = $(element).attr("id");
		});
		luke.map.rect(luke.mapVars.offsetX, luke.mapVars.offsetY,
			luke.menuContainer.outerWidth() / luke.mapVars.widthRatio, luke.menuContainer.outerHeight() / luke.mapVars.heightRatio
			).attr("fill", Raphael.color(luke.menuContainer.css("backgroundColor"))).attr("stroke", "none").id = luke.menuContainer.attr("id");
	},
	videoLoader : function (index, element) {
		var el = $(element),
			w = el.outerWidth() * 0.5,
			h = el.outerHeight() * 0.5,
			template = null,
			src = luke.templates.source.clone();


		el.find(".button").each(function(i, e){
			var size = $(e).height()* 0.5;
			$(e).css({
				top: h - size,
				left: w - size
			})
		});
		if(el.is(".audio")) {
			template = luke.templates.audio.clone();
		}
		else {
			template = luke.templates.video.clone();
		}

		el.click(function(event){
			event.preventDefault();
			template.attr({
				height: h * 2,
				width: w * 2,
				poster: el.find('.poster').attr("src")
			});
			el.find("p.src").each(function(index, element) {
				var newSrc = luke.templates.source.clone();
				newSrc.attr("src", $(element).html()).appendTo(template);
				$(element).remove();
			});
			el.find(".poster").remove();
			el.find(".button").remove();
			el.append(template);
			el.unbind("click");
			luke.stopAllVideos();
			var player = projekktor(template, {
				autoplay: true,
				playerFlashMP4: 'js/vendor/jarisplayer.swf',
		    	playerFlashMP3: 'js/vendor/jarisplayer.swf'
		    });
		    var playerId = el.find(".projekktor").attr("id");
		    projekktor("#" + playerId).addListener("start", luke.stopAllVideos);
		    luke.videoList.push(playerId);
		});
	},
	stopAllVideos : function () {
		for (var i = luke.videoList.length - 1; i >= 0; i--) {
			console.log(luke.videoList[i]);
			projekktor("#" + luke.videoList[i]).setStop();
		};
		luke.videoList = new Array();
	},
	updateMap : function () {
		var menuOffset = luke.menuContainer.offset(),
		menuMapPos = luke.map.getById("menuContainer").attr(["x", "y"]);

		luke.articles.each(function (index, element) {
			var element = $(element),
			mapElement = luke.map.getById($(element).attr("id"));
			if(element.css("display") !== "none") {
				var offset = element.offset(),
				pos = { 
					x : menuMapPos.x + ((offset.left - menuOffset.left) / luke.mapVars.widthRatio),
					y : menuMapPos.y + ((offset.top - menuOffset.top) / luke.mapVars.heightRatio)
				};
				
				mapElement.attr({ 
					x : pos.x,
					y : pos.y,
					width : $(element).outerWidth() / luke.mapVars.widthRatio,
					height : $(element).outerHeight() / luke.mapVars.heightRatio
				});
			}
			if($(element).css("display") === "none" && mapElement.attr("width") != 0) {
				mapElement.attr({
					width: 0,
					height: 0
				})
			}
		});
		luke.boxes.each(function (index, element) {
			var element = $(element),
			mapElement = luke.map.getById($(element).attr("id"));
			if(element.css("display") !== "none") {
				var offset = element.offset(),
				pos = { 
					x : menuMapPos.x + ((offset.left - menuOffset.left) / luke.mapVars.widthRatio),
					y : menuMapPos.y + ((offset.top - menuOffset.top) / luke.mapVars.heightRatio)
				};
				
				mapElement.attr({ 
					x : pos.x,
					y : pos.y,
					width : $(element).outerWidth() / luke.mapVars.widthRatio,
					height : $(element).outerHeight() / luke.mapVars.heightRatio
				});
			}
			if($(element).css("display") === "none" && mapElement.attr("width") != 0) {
				mapElement.attr({
					width: 0,
					height: 0
				})
			}
		});
	}
};

$(document).ready(function () {
	luke.init();
	projekktor(".projekktor", {
		playerFlashMP4: 'js/vendor/jarisplayer.swf',
    	playerFlashMP3: 'js/vendor/jarisplayer.swf'
    });
});