/*!
 * jquery.liquid.carousel.js
 *
 * @varsion   1.2
 * @author    rin316 [Yuta Hayashi]
 * @require   jquery.js, jquery.effects.core.js
 * @create    2012-09-11
 * @modify    2012-09-26
 * @link      https://github.com/rin316/jquery.liquid.carousel
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
		
		//indexを更新
		__this.indexUpdate(__this.index);
		
		//左右にクローン作成
		if (__this.o.loop) { __this.makeClone(); }
		
		//$listのmargin, widthを設定
		__this.setListStyle();
		
		//current表示
		__this.addCurrentClass();
		if (__this.o.currentHighlight) { __this.highlightEffect(); }
		
		//autoplay
		if (__this.o.autoPlay) { __this.autoPlay(); }
		
		
		/*
		 * Click Event
		 */
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
		
		
		/*
		 * Resize Event
		 */
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
	 * indexUpdate
	 * 引数で送られたindexを使って__this.indexを更新する。
	 * $itemの最大値より大きければ最小値にリセット、最小値より小さければ最大値にリセット
	 * @param {number} index __this.indexの値をこの値に書き換える。0から始まる
	 * @param {string} moved 'moved'を指定するとリセットの幅が狭まる。移動後の位置リセットに使用
	 * @see init, move
	 */
	indexUpdate: function (index, moved) {
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
	 * $listのwidthを返す
	 * @return {number}
	 * @see setListStyle
	 */
	calcListWidth: function () {
		var __this = this;
		return (__this.$item.length + __this.clonePrependNum + __this.cloneAppendNum ) * __this.itemWidth;
	}
	,
	
	/**
	 * calcListMarginLeft
	 * $listのmarginLeftを返す
	 * @return {number}
	 * @see setListStyle, move
	 */
	calcListMarginLeft: function () {
		var __this = this;
		return  - ( (__this.itemWidth * (__this.index + __this.clonePrependNum)) - __this.calcPos_x() );
	}
	,
	
	/**
	 * calcPos_x
	 * カレントアイテムの初期位置
	 * @return {number}
	 * @see calcListMarginLeft
	 */
	calcPos_x: function () {
		var __this = this;
		//numberであればnumberをそのまま返す
		if (!isNaN(__this.o.pos_x)) {
			return __this.o.pos_x + __this.o.pos_x_fix;
		//functionであれば実行した値を返す
		} else if ($.isFunction(__this.o.pos_x)) {
			return __this.o.pos_x() + __this.o.pos_x_fix;
		} else {
			switch (__this.o.pos_x){
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
	 * $listにwidth, marginLeftをセット
	 * @see init, move
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
	 * roop用のcloneを$itemの左右に追加
	 * @see, init
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
	 * カルーセル移動, カレント表示を1つにバインド
	 * @param {number} index __this.indexの値をこの値に書き換える。0から始まる
	 * @see init, autoPlay
	 */
	moveBind: function (index) {
		var __this = this;
		
		//index番号を更新
		__this.indexUpdate(index);
		
		//移動前にcurrent表示
		__this.addCurrentClass();
		if (__this.o.currentHighlight) { __this.highlightEffect(); }
		
		//移動
		__this.move();
	}
	,
	
	/**
	 * move
	 * (index * itemWidth)分だけ$listを移動する
	 * @see moveBind
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
						//indexを更新
						__this.indexUpdate(__this.index, 'moved');
						//位置をリセット
						__this.setListStyle();
					}
					
					//移動後にcurrent表示
					__this.addCurrentClass();
					if (__this.o.currentHighlight) { __this.highlightEffect(); }
				},
				queue: false
			})
		}
	}
	,
	
	/**
	 * addCurrentClass
	 * index番目の要素にcurrentClassをセット
	 * @see init, move
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
	 * currentClass が付いた要素をハイライト表示
	 * @see init, move
	 */
	highlightEffect: function () {
		var __this = this;
		__this.$paginationItem.animate({opacity: 0.4}, {duration: 300, queue: false});
		__this.$paginationItem + $('.' + __this.o.currentClass).animate({opacity: 1}, {duration: 300, queue: false});
	}
	,
	
	/**
	 * autoPlay
	 * 一定間隔でmoveBindを実行しカルーセルを自動で動かす
	 * @see init
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
