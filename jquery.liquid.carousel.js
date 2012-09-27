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
,   pos_x: 'left' //{number, string, function} current item position
,   pos_x_fix: 0 //{number} px
,   start: 1 //{number} index no
,   cloneClass: 'carousel-clone'
,   currentClass: 'carousel-current'
,   easing: 'swing' //{string} easing effect
,   speed: 500 //{number} milli second
,   autoPlayInterval: 5000 //{number} milli second
,   autoPlayStartDelay: 0 //{number} milli second
,   loop: false //{boolean}
,   vertical: false //{boolean}
,   currentHighlight: false //{boolean}
,   autoPlay: true //{boolean}
,   autoPlayHoverStop: false //{boolean}
};


/**
 * Carousel
 */
Carousel = function ($element, options) {
	var self = this;
	
	self.o = $.extend({}, DEFAULT_OPTIONS, options);
	
	self.$element =        $element;
	self.$list =           self.$element.find($(self.o.listSelector));
	self.$item =           self.$element.find($(self.o.itemSelector));
	self.$paginationList = self.$element.find($(self.o.paginationListSelector));
	self.$paginationItem = self.$element.find($(self.o.paginationItemSelector));
	self.$prevNavi =       self.$element.find($(self.o.prevSelector));
	self.$nextNavi =       self.$element.find($(self.o.nextSelector));
	self.$allList =        self.$paginationList.add(self.$list);
	self.$allItem  =       self.$paginationItem.add(self.$item);
	self.$allListAndNavi = self.$allList.add(self.$prevNavi).add(self.$nextNavi);
	
	self.elementSize =      (self.o.vertical) ? self.$element.outerHeight(true) : self.$element.outerWidth(true);
	self.itemSize =         (self.o.vertical) ? self.$item.outerHeight(true)    : self.$item.outerWidth(true);
	self.sizeProp =   (self.o.vertical) ? 'height' : 'width';
	self.marginProp = (self.o.vertical) ? 'marginTop' : 'marginLeft';
	
	self.clonePrependNum = 0;
	self.cloneAppendNum = 0;
	self.index = self.o.start - 1;
	self.isMoving = false;
	
	self.init();
	
	return self;
};//Carousel


/**
 * Carousel.prototype
 */
Carousel.prototype = {

	/**
	 * init
	 */
	init: function () {
		var self = this;
		
		//indexを更新
		self.indexUpdate(self.index);
		
		//左右にクローン作成
		if (self.o.loop) { self.makeClone(); }
		
		//$listのmargin, widthを設定
		self.setListStyle();
		
		//current表示
		self.addCurrentClass();
		if (self.o.currentHighlight) { self.highlightEffect(); }
		
		//autoplay
		if (self.o.autoPlay) { self.autoPlay(); }
		
		
		/*
		 * Click Event
		 */
		self.$paginationItem.on('click', function(e){
			self.moveBind(self.$paginationItem.index(this));
			e.preventDefault();
		});
		
		self.$prevNavi.on('click', function(e){
			self.moveBind(self.index - 1);
			e.preventDefault();
		});
		
		self.$nextNavi.on('click', function(e){
			self.moveBind(self.index + 1);
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
				self.elementSize = self.$element.outerWidth(true);
				if (self.o.loop) {
					self.makeClone();
				}
				self.setListStyle();
				
				_timer = null;
			}, _INTERVAL);
		});
	}
	,
	
	/**
	 * indexUpdate
	 * 引数で送られたindexを使ってself.indexを更新する。
	 * $itemの最大値より大きければ最小値にリセット、最小値より小さければ最大値にリセット
	 * @param {number} index self.indexの値をこの値に書き換える。0から始まる
	 * @param {string} moved 'moved'を指定するとリセットの幅が狭まる。移動後の位置リセットに使用
	 * @see init, move
	 */
	indexUpdate: function (index, moved) {
		var self = this;
		
		if (!self.isMoving) {
			//loopが有効 && moveする前なら
			if (self.o.loop && moved !== 'moved') {
				if (index < -1                     ){ index = self.$item.length - 1; }
				if (index > self.$item.length    ){ index = 0; }
			} else {
				if (    index < 0                      ){ index = self.$item.length - 1; }
				if (    index > self.$item.length - 1){ index = 0; }
			}
			self.index = index;
		}
	}
	,
	
	/**
	 * makeClone
	 * roop用のcloneを$itemの左右に追加
	 * @see, init
	 */
	makeClone: function () {
		var self = this, i, j;
		
		//作成要素数
		self.clonePrependNum = self.cloneAppendNum = Math.ceil(self.elementSize / self.itemSize);
		
		//既に作成された要素があれば削除
		self.$list.find($('.' + self.o.cloneClass)).remove();
		
		//prepend
		for (i = 0, j = self.$item.length - 1; i < self.clonePrependNum; i++) {
			self.$list.prepend(
				self.$item.clone().addClass(self.o.cloneClass).removeClass(self.o.currentClass)[j]
			);
			(j <= 0)? j = self.$item.length - 1 : j--;
		}
		
		//append
		for (i = 0, j = 0; i < self.cloneAppendNum; i++) {
			self.$list.append(
				self.$item.clone().addClass(self.o.cloneClass).removeClass(self.o.currentClass)[j]
			);
			(j >= self.$item.length - 1)? j = 0 : j++;
		}
	}
	,
	
	/**
	 * setListStyle
	 * $listにwidth, marginLeftをセット
	 * @see init, move
	 */
	setListStyle: function () {
		var self = this;
		
		var prop = {};
		prop[self.marginProp] = self.calcListMargin() + 'px';//marginTop, marginLeft
		prop[self.sizeProp]   = self.calcListSize() + 'px';//height, width
		self.$list.css(prop);
		console.log(prop);
	}
	,
	
	/**
	 * calcListSize
	 * $listのsizeを返す
	 * @return {number}
	 * @see setListStyle
	 */
	calcListSize: function () {
		var self = this;
		return (self.$item.length + self.clonePrependNum + self.cloneAppendNum ) * self.itemSize;
	}
	,
	
	/**
	 * calcListMargin
	 * $listのmarginLeftを返す
	 * @return {number}
	 * @see setListStyle, move
	 */
	calcListMargin: function () {
		var self = this;
		return  - ( (self.itemSize * (self.index + self.clonePrependNum)) - self.calcPos_x() );
	}
	,
	
	/**
	 * calcPos_x
	 * カレントアイテムの初期位置
	 * @return {number}
	 * @see calcListMargin
	 */
	calcPos_x: function () {
		var self = this;
		//numberであればnumberをそのまま返す
		if (!isNaN(self.o.pos_x)) {
			return self.o.pos_x + self.o.pos_x_fix;
		//functionであれば実行した値を返す
		} else if ($.isFunction(self.o.pos_x)) {
			return self.o.pos_x() + self.o.pos_x_fix;
		} else {
			switch (self.o.pos_x){
				case 'left':
					return 0 + self.o.pos_x_fix;
					break;
					
				case 'center':
					return (self.elementSize / 2) - (self.itemSize / 2) + self.o.pos_x_fix;
					break;
					
				case 'right':
					return (self.elementSize - self.itemSize) + self.o.pos_x_fix;
					break;
					
				default:
					return 0;
					break;
			}
		}
	}
	,
	
	/**
	 * moveBind
	 * カルーセル移動, カレント表示を1つにバインド
	 * @param {number} index self.indexの値をこの値に書き換える。0から始まる
	 * @see init, autoPlay
	 */
	moveBind: function (index) {
		var self = this;
		
		//index番号を更新
		self.indexUpdate(index);
		
		//移動前にcurrent表示
		self.addCurrentClass();
		if (self.o.currentHighlight) { self.highlightEffect(); }
		
		//移動
		self.move();
	}
	,
	
	/**
	 * move
	 * (index * itemSize)分だけ$listを移動する
	 * @see moveBind
	 */
	move: function () {
		var self = this
		,   prop = {}
		;
		
		prop[self.marginProp] = self.calcListMargin() + 'px';//marginTop, marginLeft
		
		if (!self.isMoving) {
			self.isMoving = true;
			self.$list.animate(
				prop,{
				duration: self.o.speed,
				easing: self.o.easing,
				complete: function(){
					self.isMoving = false;
					if (self.o.loop) {
						//indexを更新
						self.indexUpdate(self.index, 'moved');
						//位置をリセット
						self.setListStyle();
					}
					
					//移動後にcurrent表示
					self.addCurrentClass();
					if (self.o.currentHighlight) { self.highlightEffect(); }
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
		var self = this;
		
		//currentClass削除
		self.$allList.children().removeClass(self.o.currentClass);
		
		//$itemをcurrent
		self.$list.children().eq(self.clonePrependNum  + self.index).addClass(self.o.currentClass);
		
		//$itemの最大値より大きい場合は、0番目の$paginationItemをcurrent
		if (self.index > self.$item.length - 1) {
			self.$paginationItem.eq(0).addClass(self.o.currentClass);
		//$itemの最大値より小さい場合は、最後の$paginationItemをcurrent
		} else if (self.index < 0) {
			self.$paginationItem.eq(self.$item.length - 1).addClass(self.o.currentClass);
		} else {
			self.$paginationItem.eq(self.index).addClass(self.o.currentClass);
		}
	}
	,
	
	/**
	 * highlightEffect
	 * currentClass が付いた要素をハイライト表示
	 * @see init, move
	 */
	highlightEffect: function () {
		var self = this;
		self.$paginationItem.animate({opacity: 0.4}, {duration: 300, queue: false});
		self.$paginationItem + $('.' + self.o.currentClass).animate({opacity: 1}, {duration: 300, queue: false});
	}
	,
	
	/**
	 * autoPlay
	 * 一定間隔でmoveBindを実行しカルーセルを自動で動かす
	 * @see init
	 */
	autoPlay: function () {
		var self = this, timer, autoPlay, autoPlayInterval;
		autoPlayInterval = (self.o.autoPlayInterval >= 40) ? self.o.autoPlayInterval : 40;
		
		autoPlay = function(){
			self.moveBind(self.index + 1);
		};
		setTimeout(function () {
			timer = setInterval(autoPlay, autoPlayInterval);
		}, self.o.autoPlayStartDelay);
		
		//マウスオーバーされている間はautoPlayを停止。
		if (self.o.autoPlayHoverStop) {
			self.$allListAndNavi.hover(
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
