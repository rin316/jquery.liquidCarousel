/*!
 * jquery.liquid.carousel.js
 * @requires jquery.js
 */
;(function ($, window, undefined) {


//debug
var d = function (element) {
	$('input').on('click', function (e) {
		console.log(element);
		
		if (element instanceof jQuery) {
			$('.box2 h1').html(element.clone());
		} else {
			$('.box2 h1').text(element);
		}
	});
}


//window load
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
	  , speed: 300
      , currentHighlight: true
      , currentNumber: 1
	  
	  //, autoPlay: true
	  //, autoInterval: 1000
	});
});


//jqueryLiquidCarousel
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
	
	//other
	var clonePrependNum = 0;//init
	var cloneAppendNum = 0;//init
	
	var itemWidth = $item.outerWidth(true);
	var listWidth = 0;//init
	
	var currentNumber = o.currentNumber - 1;
	var isMoving = false;
	
	
	
	/*-------------------------------------------
	object > set 
	-------------------------------------------*/
	var set = {
		//setListWidth
		setListWidth: function () {
			listWidth = function () {
				if (o.loop) {
					return ($item.length + (clonePrependNum + cloneAppendNum )) * itemWidth;
				} else {
					return $item.length * itemWidth;
				}
			}
		},
		
		//setCloneNum
		setCloneNum: function () {
			//test
			var deficiencyWidth = $element.width() - (listWidth + parseFloat($list.css('margin-left')) );
			d($element.width());
			d(listWidth);
			d(deficiencyWidth);
			
			
			//clone num
			clonePrependNum = 1;//#test
			cloneAppendNum = 1;//#test
		},
		
		//roop用のcloneを作成
		makeClone: function () {
			//prepend
			for (i = 0, j = $item.length - 1; i < clonePrependNum; i++) {
				$list.prepend($item.clone()[j]);
				(j <= 0)? j = $item.length - 1 : j--;
			}
			
			//append
			for (i = 0, j = 0; i < cloneAppendNum; i++) {
				$list.append($item.clone()[j]);
				(j >= $item.length - 1)? j = 0 : j++;
			}
		},
		
		//初期style
		defaultStyle: function () {
			$list.css({
				width: listWidth + "px",
				marginLeft: "-" + itemWidth * (currentNumber + clonePrependNum) + "px"
			});
		},
		
		//[currentNumber]番目の要素にcurrentClassをセット
		addCurrentClass: function () {
			$allItem.removeClass(o.currentClass);
			//$item.eq(currentNumber).addClass(o.currentClass);//#todo cloneされてからリフレッシュ必要
			
			$controlItem.eq(currentNumber).addClass(o.currentClass);
		},
		
		//currentClass が付いた要素をハイライト
		highlightEffect: function () {
			if (o.currentHighlight) {
				$controlItem.animate({opacity: 0.4}, {duration: 300, queue: false});
				$controlItem + $("." + o.currentClass).animate({opacity: 1}, {duration: 300, queue: false});
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
					set.addCurrentClass();
					set.highlightEffect();
					isMoving = false;
				},
				queue: false
			})
		},
		
		moveCombo: function (moveNum) {
			if (!isMoving){
				set.currentNumberNormalizing(moveNum);
				set.move();
			}
		}
	}
	
	
	/*-------------------------------------------
	run
	-------------------------------------------*/
	set.setListWidth();
	set.currentNumberNormalizing(currentNumber);
	
	if (o.loop) {
		set.setCloneNum();
		set.makeClone();
		set.setListWidth();
	}
	
	set.defaultStyle();
	set.addCurrentClass();
	set.highlightEffect();
	
	
	//click
	$controlItem.on('click', function(e){
		set.moveCombo($controlItem.index(this));
		e.preventDefault();
	});
	
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
	
}//jqueryLiquidCarousel


})(jQuery, this);
