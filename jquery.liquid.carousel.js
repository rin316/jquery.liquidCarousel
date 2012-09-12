/*!
 * jquery.liquid.carousel.js
 *
 * @varsion: 1.0.1
 * @require: jquery.js, jquery.effects.core.js
 * @create : 2012-09-11 [rin316(Yuta Hayashi)]
 * @modify : 2012-09-12 autoPlayStartDelay が40以下だった場合、40になるよう変更
 */
;(function ($, window, undefined) {


var Carousel
	, DEFAULT_OPTIONS
	;

/**
 * DEFAULT_OPTIONS
 */
DEFAULT_OPTIONS = {
	listSelector: '.carousel-item',
	itemSelector: '.carousel-list',
	controlListSelector: 'carousel-control-list',
	controlItemSelector: 'carousel-control-item',
	x_position: 'left',
	x_position_fix: 0,
	animation: 'swing',
	speed: 500,
	autoPlay: false,
	autoPlayInterval: 5000,
	autoPlayStartDelay: 0,
	autoPlayHoverStop: false,
	cloneClass: 'carousel-clone',
	currentClass: 'carousel-current',
	currentHighlight: false,
	currentNumber: 1,
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
	this.$list =            this.$element.find($(this.o.listSelector));
	this.$item =            this.$element.find($(this.o.itemSelector));
	this.$controlList =     this.$element.find($(this.o.controlListSelector));
	this.$controlItem =     this.$element.find($(this.o.controlItemSelector));
	this.$prevNavi =        this.$element.find($(this.o.prevSelector));
	this.$nextNavi =        this.$element.find($(this.o.nextSelector));
	this.$allItems =        this.$controlList.add(this.$list);
	this.$allItem  =        this.$controlItem.add(this.$item);
	this.$allItemsAndNavi = this.$allItems.add(this.$prevNavi).add(this.$nextNavi);
	
	this.elementWidth = this.$element.outerWidth(true);
	this.itemWidth = this.$item.outerWidth(true);
	this.x_position = this.o.x_position;
	this.x_position_fix = this.o.x_position_fix;
	
	this.clonePrependNum = 0;
	this.cloneAppendNum = 0;
	this.currentNumber = this.o.currentNumber - 1;
	this.isMoving = false;
	
	this.init();
	
	return this;
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
		
		if (__this.o.autoPlay) { __this.autoPlay(); }
		
		
		//click
		__this.$controlItem.on('click', function(e){
			__this.moveBind(__this.$controlItem.index(this));
			e.preventDefault();
		});

		__this.$prevNavi.on('click', function(e){
			__this.moveBind(__this.currentNumber - 1);
			e.preventDefault();
		});

		__this.$nextNavi.on('click', function(e){
			__this.moveBind(__this.currentNumber + 1);
			e.preventDefault();
		});
		
		
		//resize
		$(window).on('resize', function () {
			var _timer = null
			  , _INTERVAL = 250
			  ;
			
			if (_timer) {
				clearTimeout(_timer);
				_timer = null;
			}
			
			_timer = setTimeout(function () {
				__this.elementWidth = __this.$element.outerWidth(true);
				if (__this.o.loop) {
					__this.setCloneNum();
					__this.makeClone();
				}
				__this.setListStyle();
				
				_timer = null;
			}, _INTERVAL);
		});
	},
	
	/**
	 * listWidth
	 * $listにセットするwidthを返す
	 */
	listWidth: function () {
		var __this = this;
		return (__this.$item.length + __this.clonePrependNum + __this.cloneAppendNum ) * __this.itemWidth;
	},

	/**
	 * listMarginLeft
	 * $listにセットするmarginLeftを返す
	 */
	listMarginLeft: function () {
		var __this = this;
		return  - ( (__this.itemWidth * (__this.currentNumber + __this.clonePrependNum)) - __this.listX_position() );
	},

	/**
	 * listX_position
	 * カレントの初期位置
	 * __this.listMarginLeftで使用
	 */
	listX_position: function () {
		var __this = this;
		//numberであればnumberをそのまま返す
		if (!isNaN(__this.x_position)) {
			return __this.x_position + __this.x_position_fix;
		//functionであれば実行した値を返す
		} else if ($.isFunction(__this.x_position)) {
			return __this.x_position() + __this.x_position_fix;
		} else {
			switch (__this.x_position){
				case 'left':
					return 0 + __this.x_position_fix;
					break;

				case 'center':
					return (__this.elementWidth / 2) - (__this.itemWidth / 2) + __this.x_position_fix;
					break;

				case 'right':
					return (__this.elementWidth - __this.itemWidth) + __this.x_position_fix;
					break;

				default:
					return 0;
					break;
			}
		}
	},

	/**
	 * setListStyle
	 * set $list width, marginLeft
	 */
	setListStyle: function () {
		var __this = this;
		__this.$list.css({
			width: __this.listWidth() + 'px',
			marginLeft: __this.listMarginLeft() + 'px'
		});
	},

	/**
	 * setCloneNum
	 * __this.makeCloneで使用する、作成要素数をセット
	 */
	setCloneNum: function () {
		var __this = this;
		__this.clonePrependNum = __this.cloneAppendNum = Math.ceil(__this.elementWidth / __this.itemWidth);
	},

	/**
	 * makeClone
	 * roop用のcloneを左右に作成
	 */
	makeClone: function () {
		var __this = this, i, j;
		//既に作成された要素があれば削除
		__this.$list.find($('.' + __this.o.cloneClass)).remove();

		//prepend
		for (i = 0, j = __this.$item.length - 1; i < __this.clonePrependNum; i++) {
			__this.$list.prepend(
				__this.$item.clone().addClass(__this.o.cloneClass).removeClass(__this.o.currentClass)[j]
			);
			(j <= 0)? j = __this.$item.length - 1 : j--;
		}

		//append
		for (i = 0, j = 0; i < __this.cloneAppendNum; i++) {
			__this.$list.append(
				__this.$item.clone().addClass(__this.o.cloneClass).removeClass(__this.o.currentClass)[j]
			);
			(j >= __this.$item.length - 1)? j = 0 : j++;
		}
	},

	/**
	 * currentNumberNormalizing
	 * currentNumberが$itemの最大値より大きければ最小値にリセット、最小値より小さければ最大値にリセット
	 */
	currentNumberNormalizing: function (moveNum, moved) {
		var __this = this;
		if (!__this.isMoving) {
			if (__this.o.loop) {
				//move後
				if (moved == 'moved') {
					if (moveNum < 0                      ){ moveNum = __this.$item.length - 1; }
					if (moveNum > __this.$item.length - 1){ moveNum = 0; }
				//move前
				} else {
					if (moveNum < -1                     ){ moveNum = __this.$item.length - 1; }
					if (moveNum > __this.$item.length    ){ moveNum = 0; }
				}
			} else {
				if (    moveNum < 0                      ){ moveNum = __this.$item.length - 1; }
				if (    moveNum > __this.$item.length - 1){ moveNum = 0; }
			}
			__this.currentNumber = moveNum;
		}
	},
	
	/**
	 * move
	 * [currentNumber] * itemWidth分だけ$listをずらす
	 */
	move: function () {
		var __this = this;
		if (!__this.isMoving) {
			__this.isMoving = true;
			__this.$list.animate({
				marginLeft: __this.listMarginLeft() + 'px'
			}, {
				duration: __this.o.speed,
				easing: __this.o.animation,
				complete: function(){
					__this.isMoving = false;
					if (__this.o.loop) {
						__this.currentNumberNormalizing(__this.currentNumber, 'moved');
						__this.setListStyle();
					}
					__this.addCurrentClass();
					__this.highlightEffect();
				},
				queue: false
			})
		}
	},
	
	/**
	 * moveBind
	 */
	moveBind: function (moveNum) {
		var __this = this;
		__this.currentNumberNormalizing(moveNum);
		__this.move();
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
			__this.$controlItem + $('.' + __this.o.currentClass).animate({opacity: 1}, {duration: 300, queue: false});
		}
	},

	/**
	 * autoPlay
	 */
	autoPlay: function () {
		var __this = this, timer, autoPlay, autoPlayInterval;
		autoPlayInterval = (__this.o.autoPlayInterval >= 40) ? __this.o.autoPlayInterval : 40;
		
		autoPlay = function(){
			__this.moveBind(__this.currentNumber + 1);
		};
		setTimeout(function () {
			timer = setInterval(autoPlay, autoPlayInterval);
		}, __this.o.autoPlayStartDelay);
		
		//マウスオーバーされている間はautoPlayを停止。
		if (__this.o.autoPlayHoverStop) {
			__this.$allItemsAndNavi.hover(
				function(){
					clearInterval(timer);
				},
				function() {
					timer = setInterval(autoPlay, autoPlayInterval);
				}
			);
		}
	}
	
};//Carousel.prototype

/**
 * $.fn.liquidCarousel
 */
$.fn.liquidCarousel = function (options) {
	return this.each(function () {
		var $this = $(this);
		$this.data('carousel', new Carousel($this, options));
	});
};//$.fn.liquidCarousel


})(jQuery, this);
