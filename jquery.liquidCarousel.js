/*!
 * jquery.liquidCarousel.js (git@github.com:rin316/jquery.liquidCarousel.js.git)
 * jQuery carousel plugin.
 *
 * Lastupdate: 2014-01-14 fadeのロジックを自然な表示に変更。fadeDelayを削除
 * Version: 1.6
 * Require: jquery.js
 * Link: http://rin316.github.io/jquery.liquidCarousel/
 * Author: rin316 (Yuta Hayashi) [http://5am.jp]
 * License: MIT
 */
;(function ($, window, undefined) {

var Carousel;
var DEFAULT_OPTIONS;

/**
 * DEFAULT_OPTIONS
 */
DEFAULT_OPTIONS = {
	// selector setting
	listSelector:           '.ui-carousel-list' // {string}
	,itemSelector:           'li' // {string}
	,paginationListSelector: '.ui-carousel-paginationList' // {string}
	,paginationItemSelector: 'li' // {string}
	,prevSelector:           '.ui-carousel-prev' // {string}
	,nextSelector:           '.ui-carousel-next' // {string}
	// add class name setting
	,cloneClass:   'ui-carousel-clone' // {string} - loop:true の時に作られるcloneのclass name
	,currentClass: 'ui-carousel-current' // {string} - current class name
	,disableClass: 'ui-carousel-disable' // {string} - loopingDisabled: true の時に、次itemの無い’prev', 'next'に付けられるclass name
	// animation setting
	,animate:   'slide' // {string} (slide, fade) - animation effect
	,easing:    'swing' // {string} (swing, liner, easeInOutQuad(@require jquery.effects.core.js), etc...) -  easing effect
	,speed:     500 // {number} (milli second) - animation speed
	,vertical:  false // {boolean} - true: 移動方向を横から縦に変更
	,fadeZIndexBase: 100 // {number} - 100: animate: 'fade'の時に各itemにz-index: 100がsetされる。currentは+1され101となる
	// autoPlay setting
	,autoPlay:             false // {boolean} - true: autoplay
	,autoPlayHoverStop:    true // {boolean} - true: itemにマウスオーバー中はautoplayをストップ
	,autoPlayStopLastItem: false // {boolean} - true: 最後のアイテムまでいったらautoplayをストップ
	,autoPlayInterval:     5000 // {number} (milli second) - autoplayの間隔
	,autoPlayStartDelay:   0 // {number} (milli second) - ページ表示からautoplay開始までのタイムラグ
	// option setting
	,start:            0 // {number} - index no - 初期表示するcurrentの番号。
	,group:            1 // {number} - move pieces 一度に動かすitem数
	,pos_x:            'left' // {number, string, function} current itemをleft: 左寄せ、center: 中央寄せ、right: 右寄せ。px指定も可能
	,pos_x_fix:        0 // {number} (+px, -px) pos_xの値から左右に位置を調整。centerから少し左にずらしたい時に使用
	,loop:             true // {boolean} - true: roop用のcloneをitemの左右に追加
	,loopingDisabled:  false // {boolean} - true: 次itemの無い’prev', 'next'を無効化しdisableClassを設定する
	,listHeightType:   'auto' // {boolean, string} (false, max, auto) //animate:'fade'の時のlist height指定。'fade'以外では常にfalse。false: 設定しない max: 常に一番高いitem height auto: current itemのheightに毎回更新
	,currentHighlight: true // {boolean} - true: current paginationItemをハイライト
	,resizeRefresh:    true // {boolean} - true: ブラウザresize時にlistの幅やloop item数を変更する false: resize eventを無効化
	,resizeTimer:      250 // {number} - resize eventを間引く間隔
};


/**
 * Carousel
 */
Carousel = function ($element, options) {
	var self = this;

	self.o = $.extend({}, DEFAULT_OPTIONS, options);
	self.$element =        $element;
	self.$list =           self.$element.find($(self.o.listSelector));
	self.$item =           self.$list.find($(self.o.itemSelector));
	self.$paginationList = self.$element.find($(self.o.paginationListSelector));
	self.$paginationItem = self.$paginationList.find($(self.o.paginationItemSelector));
	self.$prevNavi =       self.$element.find($(self.o.prevSelector));
	self.$nextNavi =       self.$element.find($(self.o.nextSelector));
	self.$allList =        self.$paginationList.add(self.$list);
	self.$allItem  =       self.$paginationItem.add(self.$item);
	self.$allListAndNavi = self.$allList.add(self.$prevNavi).add(self.$nextNavi);

	self.elementSize =     (self.o.vertical) ? self.$element.height() : self.$element.width();
	self.itemSize =        (self.o.vertical) ? self.$item.outerHeight(true)    : self.$item.outerWidth(true);
	self.sizeProp =        (self.o.vertical) ? 'height' : 'width';
	self.marginProp =      (self.o.vertical) ? 'marginTop' : 'marginLeft';

	//TODO 'auto'の場合はgroupをwidthから自動計算する
	//group: ( $wraper.width() + parseFloat($item.css('margin-right')) ) / $item.outerWidth(true)
	self.group           = self.o.group;
	self.clonePrependNum = 0;
	self.cloneAppendNum = 0;
	self.index = self.o.start;
	self.isMoving = false;

	if(self.o.animate === 'fade' || self.$item.length <= 1) {
		self.o.loop = false;
		self.o.resizeRefresh = false;
		self.$item.css({ zIndex: self.o.fadeZIndexBase });
		self.$item.eq(self.index).css({ zIndex: self.o.fadeZIndexBase + 1 });
	} else {
		self.o.listHeightType = false;
	}

	self.init();

	return self;
};


/**
 * Carousel.prototype
 */
(function (fn) {
	/**
	 * init
	 */
	fn.init = function () {
		var self = this;

		//indexを更新
		self.indexUpdate(self.index);

		//左右にクローン作成
		if (self.o.loop) { self.makeClone(); }

		//fadeアニメーションの初期化: index以外を隠す
		if(self.o.animate === 'fade') {
			self.$item.hide();
			self.$item.eq(self.index).show();
		}

		//$listの初期化: margin, sizeを設定
		self.setListStyle();

		//current表示
		self.addCurrentClass();
		if (self.o.currentHighlight) { self.highlightEffect(); }

		//autoplay
		if (self.o.autoPlay) { self.autoPlay(); }

		//loopingDisabled
		if (self.o.loopingDisabled) { self.loopingDisabled(); }

		//resizeRefresh
		if (self.o.resizeRefresh) { self.resizeRefresh(); }

		/*
		 * Click Event
		 */
		self.$paginationItem.on('click', function(e){
			self.moveBind(self.$paginationItem.index(this) * self.group);
			e.preventDefault();
		});

		self.$prevNavi.on('click', function(e){
			self.moveBind(self.index - self.group, this);
			e.preventDefault();
		});

		self.$nextNavi.on('click', function(e){
			self.moveBind(self.index + self.group, this);
			e.preventDefault();
		});
	};

	/**
	 * indexUpdate
	 * 引数で送られたindexを使ってself.indexを更新する。
	 * $itemの最大値より大きければ最小値にリセット、最小値より小さければ最大値にリセット
	 * @param {number} index self.indexの値をこの値に書き換える。0から始まる
	 * @param {string} moved 'moved'を指定するとリセットの幅が狭まる。移動後の位置リセットに使用
	 * @see init, moveBind, move
	 */
	fn.indexUpdate = function (index, moved) {
		var self = this;
		var indexTo = index;

		if (!self.isMoving) {

			//loopが有効 && move前
			if (self.o.loop && moved !== 'moved') {
				if (index < - self.group                        ) { indexTo = self.$item.length - 1; }
				if (index > (self.$item.length - 1) + self.group) { indexTo = 0; }
			//loopが有効 && move後
			} else if (self.o.loop && moved === 'moved') {
				if (index < 0                    ) {               indexTo = self.$item.length + index; }
				if (index > self.$item.length - 1) {               indexTo = index - self.$item.length; }
			//loop無効
			} else {
				if (self.group > 1) {
				    if (index < 0) {                               indexTo = (Math.ceil( (self.$item.length) / self.group ) - 1) * self.group; }
				} else {
				    if (index < 0) {                               indexTo = self.$item.length - 1; }
				}

				if (index > self.$item.length - 1){ indexTo = 0; }
			}
			//self.index = indexTo;

			//元のindex番号と同じならfalseを返す 変更があればindex更新
			if (self.index === indexTo) {
				return false;
			} else {
				self.index = indexTo;
				return true;
			}
		} else {
			return false;
		}
	};

	/**
	 * makeClone
	 * roop用のcloneを$itemの左右に追加
	 * @see init
	 */
	fn.makeClone = function () {
		var self = this;
		var i;
		var j;

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
	};

	/**
	 * setListStyle
	 * $listにwidth, marginLeftをセット
	 * @see init, move
	 */
	fn.setListStyle = function () {
		var self = this;
		var prop = {};
		prop[self.sizeProp]   = self.calcListSize() + 'px';//height, width
		if (! self.o.listHeightType){
			prop[self.marginProp] = self.calcListMargin() + 'px';//marginTop, marginLeft
		}
		self.$list.css(prop);
	};

	/**
	 * calcListSize
	 * $listのsizeを返す
	 * @return {number}
	 * @see setListStyle
	 */
	fn.calcListSize = function () {
		var self = this;
		if (self.o.listHeightType === 'max') {
			//return max $itemをループして一番大きいheight. 違うメソッドにする
		} else if (self.o.listHeightType === 'auto') {
			//return auto $litem[index] の height. 毎回取得よりも、先に取得して配列化した方が良いかも
		} else {
			return (self.$item.length + self.clonePrependNum + self.cloneAppendNum ) * self.itemSize;
		}
	};

	/**
	 * calcListMargin
	 * $listのmarginLeftを返す
	 * @return {number}
	 * @see setListStyle, move
	 */
	fn.calcListMargin = function () {
		var self = this;
		return  - ( (self.itemSize * (self.index + self.clonePrependNum)) - self.calcPos_x() );
	};

	/**
	 * calcPos_x
	 * カレントアイテムの初期位置
	 * @return {number}
	 * @see calcListMargin
	 */
	fn.calcPos_x = function () {
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
	};

	/**
	 * moveBind
	 * カルーセル移動, カレント表示を1つにバインド
	 * @param {number} index self.indexの値をこの値に書き換える。0から始まる
	 * @param {object} element clickされたelement
	 * @see init, autoPlay
	 */
	fn.moveBind = function (index, element) {
		var self = this;

		//clickした要素のclassが'disable'の場合は抜ける
		if ($(element).hasClass(self.o.disableClass)) { return false;}

		//index番号を更新 更新が無ければ抜ける
		if(! self.indexUpdate(index)) { return false; }

		//移動前にcurrent表示
		self.addCurrentClass();
		if (self.o.currentHighlight) { self.highlightEffect(); }

		//loopingDisabled
		if (self.o.loopingDisabled) { self.loopingDisabled(); }

		//移動
		self.animate();
	};

	/**
	 * animate
	 * self.o.animateで設定されているアニメーションメソッドを実行する。
	 */
	fn.animate = function () {
		var self = this;

		switch (self.o.animate) {
			case 'slide':
				self.animateSlide();
				break;

			case 'fade':
				self.animateFade();
				break;

			default:
				self.animateSlide();
				break;
		}
	};

	/**
	 * animateSlide
	 * スライドアニメーション - (index * itemSize)分だけ$listを移動する
	 * @see animate
	 */
	fn.animateSlide = function () {
		var self = this;
		var prop = {};

		prop[self.marginProp] = self.calcListMargin() + 'px';//marginTop, marginLeft

		if (!self.isMoving) {
			self.isMoving = true;
			self.$element.trigger('carousel:movestart');
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

					self.$element.trigger('carousel:moveend');
				},
				queue: false
			})
		}
	};

	/**
	 * animateFade
	 * フェードアニメーション
	 * @see animate
	 */
	fn.animateFade = function () {
		var self = this;

		if (!self.isMoving) {
			self.$element.trigger('carousel:movestart');
			self.isMoving = true;
			self.$item.css({ zIndex: self.o.fadeZIndexBase });
			self.$item.eq(self.index)
				.css({ zIndex: self.o.fadeZIndexBase + 1 })
				.fadeIn(self.o.speed, function () {
					self.$item.not(self.$item.eq(self.index)).hide();
					self.setListStyle();
					self.isMoving = false;
					self.$element.trigger('carousel:moveend');
				});
		}
	};

	/**
	 * addCurrentClass
	 * index番目の要素にcurrentClassをセット
	 * @see init, move
	 */
	fn.addCurrentClass = function () {
		var self = this;
		var paginationIndex;

		//currentClass削除
		self.$allList.children().removeClass(self.o.currentClass);

		//$itemをcurrent
		self.$list.children().eq(self.clonePrependNum  + self.index).addClass(self.o.currentClass);

		//$itemの最大値より大きい場合は、0番目の$paginationItemをcurrent
		if (self.index > self.$item.length -1) {
			paginationIndex = 0;
		//$itemの最大値より小さい場合は、最後の$paginationItemをcurrent
		} else if (self.index < 0) {
			paginationIndex = Math.floor( (self.$item.length + self.index) / self.group );
		} else {
			paginationIndex = Math.floor(self.index / self.group);
		}
		self.$paginationItem.eq(paginationIndex).addClass(self.o.currentClass);
	};

	/**
	 * highlightEffect
	 * currentClass が付いた要素をハイライト表示
	 * @see init, move
	 */
	fn.highlightEffect = function () {
		var self = this;
		self.$paginationItem.animate({opacity: 0.4}, {duration: 300, queue: false});
		self.$paginationItem + $('.' + self.o.currentClass).animate({opacity: 1}, {duration: 300, queue: false});
	}

	/**
	 * autoPlay
	 * 一定間隔でmoveBindを実行しカルーセルを自動で動かす
	 * @see init
	 */
	fn.autoPlay = function () {
		var self = this, timer, autoPlay, autoPlayInterval;
		autoPlayInterval = (self.o.autoPlayInterval >= 40) ? self.o.autoPlayInterval : 40;

		autoPlay = function(){
			if (self.o.autoPlayStopLastItem && self.index >= self.$item.length - self.group) {
				clearInterval(timer);
			} else {
				self.moveBind(self.index + 1);
			}
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
	};

	/**
	 * loopingDisabled
	 * 前のアイテム, 次のアイテムが無い場合に、prev, nextボタンにclass self.o.disableClassを付与する
	 * @see init, moveBind
	 */
	fn.loopingDisabled = function () {
		var self = this;

		if (self.index - (self.group - 1) <= 0){
			self.$prevNavi.addClass(self.o.disableClass)
		} else {
			self.$prevNavi.removeClass(self.o.disableClass)
		}

		if (self.index + (self.group - 1) >= self.$item.length -1){
			self.$nextNavi.addClass(self.o.disableClass)
		} else {
			self.$nextNavi.removeClass(self.o.disableClass)
		}
	};

	/**
	 * resizeRefresh
	 * ブラウザがリサイズされたら描画をリフレッシュ
	 * @see init
	 */
	fn.resizeRefresh = function () {
		var self = this;

		$(window).on('resize', function () {
			//timerを使用しリフレッシュ間隔を制限
			if (self.o.resizeTimer) {
				var _timer = null;
				var _INTERVAL = self.o.resizeTimer;

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
			//timerを使用しない
			} else {
				self.elementSize = self.$element.outerWidth(true);
				if (self.o.loop) {
					self.makeClone();
				}
				self.setListStyle();
			}
		});
	};
})(Carousel.prototype);


/**
 * $.fn.liquidCarousel
 */
$.fn.liquidCarousel = function (options) {
	return this.each(function () {
		var $this = $(this);
		$this.data('carousel', new Carousel($this, options));
	});
};


})(jQuery, this);
