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
	listSelector: '.carousel-item'
,   itemSelector: '.carousel-list'
,   paginationListSelector: 'carousel-pagination-list'
,   paginationItemSelector: 'carousel-pagination-item'
,   prevSelector: '.carousel-prev'
,   nextSelector: '.carousel-next'

,   pos_x: 'left'
,   pos_x_fix: 0
,   index: 1
,   cloneClass: 'carousel-clone'
,   currentClass: 'carousel-current'
,   easing: 'swing'
,   speed: 500
,   autoPlayInterval: 5000
,   autoPlayStartDelay: 0

,   loop: false
,   currentHighlight: false
,   autoPlay: true
,   autoPlayHoverStop: false
};


/**
 * Carousel
 */
Carousel = function ($element, options) {
	var __this = this;
	
	__this.o = $.extend({}, DEFAULT_OPTIONS, options);
	
	__this.$element =        $element;
	__this.$list =           __this.$element.find($(__this.o.listSelector));
	__this.$item =           __this.$element.find($(__this.o.itemSelector));
	__this.$paginationList = __this.$element.find($(__this.o.paginationListSelector));
	__this.$paginationItem = __this.$element.find($(__this.o.paginationItemSelector));
	__this.$prevNavi =       __this.$element.find($(__this.o.prevSelector));
	__this.$nextNavi =       __this.$element.find($(__this.o.nextSelector));
	__this.$allList =        __this.$paginationList.add(__this.$list);
	__this.$allItem  =       __this.$paginationItem.add(__this.$item);
	__this.$allListAndNavi = __this.$allList.add(__this.$prevNavi).add(__this.$nextNavi);
	
	__this.elementWidth = __this.$element.outerWidth(true);
	__this.itemWidth = __this.$item.outerWidth(true);
	
	__this.clonePrependNum = 0;
	__this.cloneAppendNum = 0;
	__this.index = __this.o.index - 1;
	__this.isMoving = false;
	
	__this.init();
	
	return __this;
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
		
		__this.indexReset(__this.index);
		
		if (__this.o.loop) {
			__this.makeClone();
		}

		__this.setListStyle();
		__this.addCurrentClass();
		__this.highlightEffect();
		
		if (__this.o.autoPlay) { __this.autoPlay(); }
		
		
		//click
		__this.$paginationItem.on('click', function(e){
			__this.moveBind(__this.$paginationItem.index(this));
			e.preventDefault();
		});

		__this.$prevNavi.on('click', function(e){
			__this.moveBind(__this.index - 1);
			e.preventDefault();
		});

		__this.$nextNavi.on('click', function(e){
			__this.moveBind(__this.index + 1);
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
					__this.makeClone();
				}
				__this.setListStyle();
				
				_timer = null;
			}, _INTERVAL);
		});
	}
	,
	
	/**
	 * indexReset
	 * indexが$itemの最大値より大きければ最小値にリセット、最小値より小さければ最大値にリセット
	 */
	indexReset: function (index, moved) {
		var __this = this;
		
		if (!__this.isMoving) {
			//loopが有効 && moveする前なら
			if (__this.o.loop && moved !== 'moved') {
				if (index < -1                     ){ index = __this.$item.length - 1; }
				if (index > __this.$item.length    ){ index = 0; }
			} else {
				if (    index < 0                      ){ index = __this.$item.length - 1; }
				if (    index > __this.$item.length - 1){ index = 0; }
			}
			__this.index = index;
		}
	}
	,
	
	/**
	 * calcListWidth
	 * $listにセットするwidthを返す
	 */
	calcListWidth: function () {
		var __this = this;
		return (__this.$item.length + __this.clonePrependNum + __this.cloneAppendNum ) * __this.itemWidth;
	}
	,

	/**
	 * calcListMarginLeft
	 * $listにセットするmarginLeftを返す
	 */
	calcListMarginLeft: function () {
		var __this = this;
		return  - ( (__this.itemWidth * (__this.index + __this.clonePrependNum)) - __this.calcPos_x() );
	}
	,
	
	/**
	 * calcPos_x
	 * カレントの初期位置
	 * __this.listMarginLeftで使用
	 */
	calcPos_x: function () {
		var __this = this;
		//numberであればnumberをそのまま返す
		if (!isNaN(__this.o.calcPos_x)) {
			return __this.o.calcPos_x + __this.o.pos_x_fix;
		//functionであれば実行した値を返す
		} else if ($.isFunction(__this.o.calcPos_x)) {
			return __this.o.calcPos_x() + __this.o.pos_x_fix;
		} else {
			switch (__this.o.calcPos_x){
				case 'left':
					return 0 + __this.o.pos_x_fix;
					break;

				case 'center':
					return (__this.elementWidth / 2) - (__this.itemWidth / 2) + __this.o.pos_x_fix;
					break;

				case 'right':
					return (__this.elementWidth - __this.itemWidth) + __this.o.pos_x_fix;
					break;

				default:
					return 0;
					break;
			}
		}
	}
	,
	
	/**
	 * setListStyle
	 * set $list width, marginLeft
	 */
	setListStyle: function () {
		var __this = this;
		__this.$list.css({
			width: __this.calcListWidth() + 'px',
			marginLeft: __this.calcListMarginLeft() + 'px'
		});
	}
	,

	/**
	 * makeClone
	 * roop用のcloneを左右に作成
	 */
	makeClone: function () {
		var __this = this, i, j;
		
		//作成要素数
		__this.clonePrependNum = __this.cloneAppendNum = Math.ceil(__this.elementWidth / __this.itemWidth);
		
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
	}
	,
	
	/**
	 * moveBind
	 */
	moveBind: function (index) {
		var __this = this;
		__this.indexReset(index);
		__this.addCurrentClass();
		__this.highlightEffect();
		__this.move();
	}
	,
	
	/**
	 * move
	 * [index] * itemWidth分だけ$listをずらす
	 */
	move: function () {
		var __this = this;
		if (!__this.isMoving) {
			__this.isMoving = true;
			__this.$list.animate({
				marginLeft: __this.calcListMarginLeft() + 'px'
			}, {
				duration: __this.o.speed,
				easing: __this.o.easing,
				complete: function(){
					__this.isMoving = false;
					if (__this.o.loop) {
						__this.indexReset(__this.index, 'moved');
						__this.setListStyle();
					}
					__this.addCurrentClass();
					__this.highlightEffect();
				},
				queue: false
			})
		}
	}
	,

	/**
	 * addCurrentClass
	 * [index]番目の要素にcurrentClassをセット
	 */
	addCurrentClass: function () {
		var __this = this;
		
		//currentClass削除
		__this.$allList.children().removeClass(__this.o.currentClass);
		
		//$itemをcurrent
		__this.$list.children().eq(__this.clonePrependNum  + __this.index).addClass(__this.o.currentClass);
		
		//$itemの最大値より大きい場合は、0番目の$paginationItemをcurrent
		if (__this.index > __this.$item.length - 1) {
			__this.$paginationItem.eq(0).addClass(__this.o.currentClass);
		//$itemの最大値より小さい場合は、最後の$paginationItemをcurrent
		} else if (__this.index < 0) {
			__this.$paginationItem.eq(__this.$item.length - 1).addClass(__this.o.currentClass);
		} else {
			__this.$paginationItem.eq(__this.index).addClass(__this.o.currentClass);
		}
	}
	,

	/**
	 * highlightEffect
	 * currentClass が付いた要素をハイライト
	 */
	highlightEffect: function () {
		var __this = this;
		if (__this.o.currentHighlight) {
			__this.$paginationItem.animate({opacity: 0.4}, {duration: 300, queue: false});
			__this.$paginationItem + $('.' + __this.o.currentClass).animate({opacity: 1}, {duration: 300, queue: false});
		}
	}
	,
	
	/**
	 * autoPlay
	 */
	autoPlay: function () {
		var __this = this, timer, autoPlay, autoPlayInterval;
		autoPlayInterval = (__this.o.autoPlayInterval >= 40) ? __this.o.autoPlayInterval : 40;
		
		autoPlay = function(){
			__this.moveBind(__this.index + 1);
		};
		setTimeout(function () {
			timer = setInterval(autoPlay, autoPlayInterval);
		}, __this.o.autoPlayStartDelay);
		
		//マウスオーバーされている間はautoPlayを停止。
		if (__this.o.autoPlayHoverStop) {
			__this.$allListAndNavi.hover(
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
