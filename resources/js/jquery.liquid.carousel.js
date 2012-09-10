/*!
 * jquery.liquid.carousel.js
 * @requires jquery.js
 */
;(function ($, window, undefined) {


var Carousel
	, DEFAULT_OPTIONS
	;

/**
 * DEFAULT_OPTIONS
 */
DEFAULT_OPTIONS = {
	itemListSelector: "ul",
	itemSelector: "li",
	controlSelector: ".controlArea",
	controlList: "ul",
	controlItem: "li",
	currentNumber: 1,
	x_position: "left",
	speed: 500,
	animation: "swing",
	currentClass: "mod-topContents-current",
	currentHighlight: false,
	cloneClass: "mod-topContents-clone",
	autoPlay: false,
	autoInterval: 5000,
	loop: false,
	prevSelector: false,
	nextSelector: false
};


/**
 * Carousel
 */
Carousel = function ($element, options) {
	this.o = $.extend({}, DEFAULT_OPTIONS, options);
	
	this.$element =         $element;
	this.$list =            this.$element.find($(this.o.itemListSelector));
	this.$item =            this.$element.find($(this.o.itemSelector));
	this.$control =         this.$element.find($(this.o.controlSelector));
	this.$controlList =     this.$element.find($(this.o.controlList));
	this.$controlItem =     this.$element.find($(this.o.controlItem));
	this.$prevNavi =        this.$element.find($(this.o.prevSelector));
	this.$nextNavi =        this.$element.find($(this.o.nextSelector));
	this.$allItems =        this.$controlList.add(this.$list);
	this.$allItem  =        this.$controlItem.add(this.$item);
	this.$allItemAndNavi  = this.$allItem.add(this.$prevNavi).add(this.$nextNavi);
	
	this.elementWidth = this.$element.outerWidth(true);
	this.itemWidth = this.$item.outerWidth(true);
	this.x_position = this.o.x_position;
	this.x_positionNum = 0;//init
	
	this.clonePrependNum = 0;//init
	this.cloneAppendNum = 0;//init
	this.currentNumber = this.o.currentNumber - 1;
	this.isMoving = false;
	
	this.init();
	
	return this;//#todo 必要？
};//Carousel


/**
 * Carousel.prototype
 */
Carousel.prototype = {

	/**
	 * init
	 */
	init: function () {
		var __this = this;
		
		__this.currentNumberNormalizing(__this.currentNumber);

		if (__this.o.loop) {
			__this.setCloneNum();
			__this.makeClone();
		}

		__this.setListStyle();
		__this.addCurrentClass();
		__this.highlightEffect();
		
		
		//click
		__this.$controlItem.on('click', function(e){
			__this.moveCombo(__this.$controlItem.index(this));
			e.preventDefault();
		});

		__this.$prevNavi.on('click', function(e){
			__this.moveCombo(__this.currentNumber - 1);
			e.preventDefault();
		});

		__this.$nextNavi.on('click', function(e){
			__this.moveCombo(__this.currentNumber + 1);
			e.preventDefault();
		});
		
		
		//resize
		$(window).on('resize', function () {
			__this.elementWidth = __this.$element.outerWidth(true);
			__this.setCloneNum();
			__this.makeClone();
			__this.setListStyle();
		});
	},
	
	/**
	 * listWidth
	 * return $list Width
	 */
	listWidth: function () {
		var __this = this;
		return __this.$item.length + (__this.clonePrependNum + __this.cloneAppendNum ) * __this.itemWidth;
	},

	/**
	 * listMarginLeft
	 * return $list marginLeft
	 */
	listMarginLeft: function () {
		var __this = this;
		return  - ( (__this.itemWidth * (__this.currentNumber + __this.clonePrependNum)) - __this.listX_position() );
	},

	/**
	 * listX_position
	 * return $list x_position
	 */
	listX_position: function () {
		var __this = this;
		if (!isNaN(__this.x_position)) {
			return __this.x_positionNum = __this.x_position;
		} else {
			switch (__this.x_position){
				case 'left':
					return __this.x_positionNum = 0;
					break;

				case 'center':
					return __this.x_positionNum = (__this.elementWidth / 2) - (__this.itemWidth / 2);
					break;

				case 'right':
					return __this.x_positionNum = __this.elementWidth - __this.itemWidth;
					break;

				default:
					return __this.x_positionNum = 0;
					break;
			}
		}
	},

	/**
	 * set $list style
	 * setListStyle
	 */
	setListStyle: function () {
		var __this = this;
		__this.$list.css({
			width: __this.listWidth() + "px",
			marginLeft: __this.listMarginLeft() + "px"
		});
	},

	/**
	 * setCloneNum
	 */
	setCloneNum: function () {
		var __this = this;
		__this.clonePrependNum = __this.cloneAppendNum = Math.ceil(__this.elementWidth / __this.itemWidth);
	},

	/**
	 * makeClone
	 * roop用のcloneを作成
	 */
	makeClone: function () {
		var __this = this, i, j;
		//既に作成された要素があれば削除
		__this.$list.find($(".mod-topContents-clone")).remove();//#toto classをoに変更

		//prepend
		for (i = 0, j = __this.$item.length - 1; i < __this.clonePrependNum; i++) {
			__this.$list.prepend(__this.$item.clone().addClass(__this.o.cloneClass).removeClass(__this.o.currentClass)[j]);
			(j <= 0)? j = __this.$item.length - 1 : j--;
		}

		//append
		for (i = 0, j = 0; i < __this.cloneAppendNum; i++) {
			__this.$list.append(__this.$item.clone().addClass(__this.o.cloneClass).removeClass(__this.o.currentClass)[j]);
			(j >= __this.$item.length - 1)? j = 0 : j++;
		}
	},

	/**
	 * addCurrentClass
	 * [currentNumber]番目の要素にcurrentClassをセット
	 */
	addCurrentClass: function () {
		var __this = this;
		__this.$allItem.removeClass(__this.o.currentClass);
		__this.$item.eq(__this.currentNumber).addClass(__this.o.currentClass);
		__this.$controlItem.eq(__this.currentNumber).addClass(__this.o.currentClass);
	},

	/**
	 * highlightEffect
	 * currentClass が付いた要素をハイライト
	 */
	highlightEffect: function () {
		var __this = this;
		if (__this.o.currentHighlight) {
			__this.$controlItem.animate({opacity: 0.4}, {duration: 300, queue: false});
			__this.$controlItem + $("." + __this.o.currentClass).animate({opacity: 1}, {duration: 300, queue: false});
		}
	},

	/**
	 * currentNumberNormalizing
	 * move前に実行される。currentNumberがアイテムの最大値より大きければ最小値を、最小値より小さければ最大値をセット。
	 */
	currentNumberNormalizing: function (moveNum) {
		var __this = this;
		if (!__this.isMoving){
			if (__this.o.loop) {
				if (moveNum > __this.$item.length){ moveNum = 0; }
				if (moveNum < -1){ moveNum = __this.$item.length - 1; }
			} else {
				if (moveNum > __this.$item.length - 1){ moveNum = 0; }
				if (moveNum < 0){ moveNum = __this.$item.length - 1; }
			}
			__this.currentNumber = moveNum;
		}
	},
	
	/**
	 * roopReset
	 * move後に実行される。currentNumberNormalizing よりも最大値・最小値が1少ない値で最大値より大きければ最小値を、最小値より小さければ最大値をセット。
	 */
	roopReset: function () {
		var __this = this;
		if (__this.currentNumber < 0 || __this.currentNumber > __this.$item.length - 1) {
			if (__this.currentNumber < 0) { __this.currentNumber = __this.$item.length - 1; }
			if (__this.currentNumber > __this.$item.length - 1) { __this.currentNumber = 0; }
		}
	},

	/**
	 * move
	 * [currentNumber] * itemWidth分だけ$listを左にずらす
	 */
	move: function () {
		var __this = this;
		if (!__this.isMoving){
			__this.isMoving = true;
			__this.$list.animate({
				marginLeft: __this.listMarginLeft() + "px"
			}, {
				duration: __this.o.speed,
				easing: __this.o.animation,
				complete: function(){
					if (__this.o.loop) {
						__this.roopReset();
						__this.setListStyle();
					}
					__this.addCurrentClass();
					__this.highlightEffect();
					__this.isMoving = false;
				},
				queue: false
			})
		}
	},
	
	/**
	 * moveCombo
	 */
	moveCombo: function (moveNum) {
		var __this = this;
		__this.currentNumberNormalizing(moveNum);
		__this.move();
	},

	/**
	 * autoPlay
	 */
	autoPlay: function () {
		var __this = this;
		if (__this.o.autoPlay) {
			var autoPlay = function(){
				__this.moveCombo(__this.currentNumber + 1);
			};
			var timer = setInterval(autoPlay, __this.o.autoInterval);

			//マウスオーバーされている間はautoPlayを停止。
			__this.$allItemAndNavi.hover(
				function(){
					clearInterval(timer);
				},
				function() {
					timer = setInterval(autoPlay, __this.o.autoInterval);
				}
			);
		}
	}
	
};//Carousel.prototype

/**
 * $.fn.carousel
 */
$.fn.carousel = function (options) {
	return this.each(function () {
		var $this = $(this);
		$this.data('carousel', new Carousel($this, options));
	});
};//$.fn.carousel






//window load
$(window).load(function(){
	$('.mod-topContents').carousel({
		itemListSelector: '.mod-topContents-visual-list'
	  , itemSelector: '.mod-topContents-visual-item'
	  , controlSelector: '.mod-topContents-controller'
	  , controlList: '.mod-topContents-controller-list'
	  , controlItem: '.mod-topContents-controller-item'
	  , prevSelector: '.mod-topContents-prev'
	  , nextSelector: '.mod-topContents-next'
	  , x_position: 'center'
	  , loop: true
	  , speed: 300
      , currentHighlight: true
      , currentNumber: 1
	  //, autoPlay: true
	  //, autoInterval: 1000
	});
});





})(jQuery, this);
