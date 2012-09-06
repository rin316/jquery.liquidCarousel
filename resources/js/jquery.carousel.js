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
	var itemWidth = $item.outerWidth(true);
	var listWidth = $item.length * itemWidth;
	var currentNumber = o.currentNumber - 1;
	
	
	/*-------------------------------------------
	object > set 
	-------------------------------------------*/
	var set = {
		//set default style
		setDefaultStyle: function () {
			$list.css({
				width: listWidth + "px",
				marginLeft: "-" + itemWidth * currentNumber + "px"
			});
		},
		
		//[currentNumber]番目の要素にcurrentClassをセット
		setCurrentClass: function () {
			$allItem.removeClass(o.currentClass);
			$item.eq(currentNumber).addClass(o.currentClass);
			$controlItem.eq(currentNumber).addClass(o.currentClass);
		},
		
		//currentClass が付いた要素をハイライト
		setHighlightEffect: function () {
			if (o.currentHighlight) {
				$controlItem.animate({opacity: 0.4}, {duration: 300, queue: false})
				$controlItem + $("." + o.currentClass).animate({opacity: 1}, {duration: 300, queue: false})
			}
		},
		
		setCurrentNumberNormalizing: function (moveNum) {
			if (moveNum > $item.length - 1){
				moveNum = 0;
			}
			if (moveNum < 0){
				moveNum = $item.length - 1;
			}
			currentNumber = moveNum;
		},
		
		//[currentNumber] * itemWidth分だけ$listを左にずらす
		setMove: function () {
			$list.animate({
				marginLeft: "-" + itemWidth * currentNumber + "px"
			}, {
				duration: o.speed,
				easing: o.animation,
				complete: function(){
					//after
				},
				queue: false
			})
		},
		
		//set Move Combo
		setMoveCombo: function (moveNum) {
			set.setCurrentNumberNormalizing(moveNum);
			set.setCurrentClass();
			set.setHighlightEffect();
			set.setMove();
		}
	}
	
	
	/*-------------------------------------------
	run
	-------------------------------------------*/
	//onload
	set.setCurrentNumberNormalizing(currentNumber);
	set.setDefaultStyle();
	set.setCurrentClass();
	set.setHighlightEffect();
	
	//hover
	$controlItem.on('click', function(e){
		//何番目の要素かを取得しcurrentNumberへセット
		set.setMoveCombo($controlItem.index(this));
		e.preventDefault();
	});
	
	//click
	$prevNavi.on('click', function(e){
		set.setMoveCombo(currentNumber - 1);
		e.preventDefault();
	});
	
	$nextNavi.on('click', function(e){
		set.setMoveCombo(currentNumber + 1);
		e.preventDefault();
	});
	
	if (o.autoPlay) {
		(function () {
			var autoPlay = function(){
				set.setMoveCombo(currentNumber + 1);
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
