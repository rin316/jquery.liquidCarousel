/*!
 * jquery.liquid.carousel.js
 * @requires jquery.js
 */
;(function ($, window, undefined) {

$(window).load(function(){
	jqueryLiquidCarousel({
		containerSelector: '.mod-topContents'
	  , itemListSelector: '.mod-topContents-visual-list'
	  , itemSelector: '.mod-topContents-visual-item'
	  , controlSelector: '.mod-topContents-controller'
	  , controlList: '.mod-topContents-controller-list'
	  , controlItem: '.mod-topContents-controller-item'
	  , prevSelector: '.mod-topContents-prev'
	  , nextSelector: '.mod-topContents-next'
	  , loop: true
	  , speed: 500
	  //, autoPlay: true
	  //, autoInterval: 500
	});
});


var jqueryLiquidCarousel = function(options){
	//default options
	var defaults = {
		containerSelector: ".mainVisualArea",
		itemListSelector: "ul",
		itemSelector: "li",
		controlSelector: ".controlArea",
		controlList: "ul",
		controlItem: "li",
		currentNumber: 1,
		speed: 500,
		animation: "swing",
		currentClass: "carouselCurrent",
		currentHighlight: false,
		autoPlay: false,
		autoInterval: 5000,
		loop: false,
		prevSelector: false,
		nextSelector: false
	};
	var o = $.extend(defaults, options);
	
	//jQuery object
	var $this = $(this);
	var $element = $(o.containerSelector);
	var $list = $element.find($(o.itemListSelector));
	var $item = $list.find($(o.itemSelector));
	var $control = $(o.controlSelector);
	var $controlList = $control.find($(o.controlList));
	var $controlItem = $controlList.find($(o.controlItem));
	var $prevNavi = $(o.prevSelector);
	var $nextNavi = $(o.nextSelector);
	var $allItems = $controlList.add($list);
	var $allItem  = $controlItem.add($item);
	var $allItemAndNavi  = $allItem.add($prevNavi).add($nextNavi);
	
	//other variables
	var clonePrependNum = (o.loop)? 1 : 0;//#todo
	var cloneAppendNum = (o.loop)? 1 : 0;//#todo
	
	var itemWidth = $item.outerWidth(true);
	//var listWidth = (o.loop)? ($item.length + (clonePrependNum + cloneAppendNum )) * itemWidth : $item.length * itemWidth;
	var listWidth = (function () {
		if (o.loop) {
			return ($item.length + (clonePrependNum + cloneAppendNum )) * itemWidth;
		} else {
			return $item.length * itemWidth;
		}
	})();
	
	var currentNumber = o.currentNumber - 1;
	var isMoving = false;
	
	/*-------------------------------------------
	object > set 
	-------------------------------------------*/
	var set = {
		//初期style
		defaultStyle: function () {
			$list.css({
				width: listWidth + "px",
				marginLeft: "-" + itemWidth * (currentNumber + clonePrependNum) + "px"
			});
		},
		
		//roop用のcloneを作成
		makeClone: function () {
			$list.prepend($item.clone()[$item.length - 1]);
			$list.append($item.clone()[0]);
		},
		
		//[currentNumber]番目の要素にcurrentClassをセット
		addCurrentClass: function () {
			$allItem.removeClass(o.currentClass);
			$item.eq(currentNumber).addClass(o.currentClass);
			$controlItem.eq(currentNumber).addClass(o.currentClass);
		},
		
		//currentClass が付いた要素をハイライト
		highlightEffect: function () {
			if (o.currentHighlight) {
				$controlItem.animate({opacity: 0.4}, {duration: 300, queue: false})
				$controlItem + $("." + o.currentClass).animate({opacity: 1}, {duration: 300, queue: false})
			}
		},
		
		//currentNumberがアイテムの最大値より大きければ最小値を、最小値より小さければ最大値をセット。
		currentNumberNormalizing: function (moveNum) {
			if (o.loop) {
				if (moveNum > $item.length){ moveNum = 0; }
				if (moveNum < -1){ moveNum = $item.length - 1; }
			} else {
				if (moveNum > $item.length - 1){ moveNum = 0; }
				if (moveNum < 0){ moveNum = $item.length - 1; }
			}
			currentNumber = moveNum;
		},
		
		//currentNumberNormalizing よりも最大値・最小値が1少ない値で最大値より大きければ最小値を、最小値より小さければ最大値をセットし位置をリセット。
		roopReset: function () {
			var moveNum = 0;
			
			if (currentNumber < 0) { currentNumber = $item.length - 1; }
			if (currentNumber > $item.length - 1) { currentNumber = 0; }
			$list.css('marginLeft', "-" + itemWidth * (currentNumber + clonePrependNum) + "px");
			
		},
		
		//[currentNumber] * itemWidth分だけ$listを左にずらす
		move: function () {
			isMoving = true;
			$list.animate({
				marginLeft: "-" + itemWidth * (currentNumber + clonePrependNum) + "px"
			}, {
				duration: o.speed,
				easing: o.animation,
				complete: function(){
					if (o.loop) { set.roopReset() }
					isMoving = false;
				},
				queue: false
			})
		},
		
		moveCombo: function (moveNum) {
			if (!isMoving){
				set.currentNumberNormalizing(moveNum);
				set.addCurrentClass();
				set.highlightEffect();
				set.move();
			}
		}
	}
	
	
	/*-------------------------------------------
	run
	-------------------------------------------*/
	//onload
	set.currentNumberNormalizing(currentNumber);
	if (o.loop) {
		set.makeClone();
	}
	set.defaultStyle();
	set.addCurrentClass();
	set.highlightEffect();
	
	//hover
	$controlItem.on('click', function(e){
		set.moveCombo($controlItem.index(this));
		e.preventDefault();
	});
	
	//click
	$prevNavi.on('click', function(e){
		set.moveCombo(currentNumber - 1);
		e.preventDefault();
	});
	
	$nextNavi.on('click', function(e){
		set.moveCombo(currentNumber + 1);
		e.preventDefault();
	});
	
	if (o.autoPlay) {
		(function () {
			var autoPlay = function(){
				set.moveCombo(currentNumber + 1);
			};
			var timer = setInterval(autoPlay, o.autoInterval);
			
			//マウスオーバーされている間はautoPlayを停止。
			$allItemAndNavi.hover(
				function(){
					clearInterval(timer);
				},
				function() {
					timer = setInterval(autoPlay, o.autoInterval);
				}
			);
		})();
	}
}


})(jQuery, this);
