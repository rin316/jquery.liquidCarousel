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
	  , x_position: 'center'
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
	
	var elementWidth = $element.outerWidth(true);
	var itemWidth = $item.outerWidth(true);
	var listWidth = 0;//init
	var listMarginLeft = 0;//init
	
	var x_position = o.x_position;
	var x_positionNum = 0;//init
	
	var currentNumber = o.currentNumber - 1;
	var isMoving = false;
	
	
	/*-------------------------------------------
	object > set 
	-------------------------------------------*/
	var set = {
		//return $list Width
		listWidth: function () {
			return listWidth = ($item.length + (clonePrependNum + cloneAppendNum )) * itemWidth;
		},
		
		//return $list marginLeft
		listMarginLeft: function () {
			return listMarginLeft = - ( (itemWidth * (currentNumber + clonePrependNum)) - set.listX_position() );
		},
		
		//return $list x_position
		listX_position: function () {
			if (!isNaN(x_position)) {
				return x_positionNum = x_position;
			} else {
				switch (x_position){
					case 'left':
						return x_positionNum = 0;
						break;
						
					case 'center':
						return x_positionNum = (elementWidth / 2) - (itemWidth / 2);
						break;
						
					case 'right':
						return x_positionNum = elementWidth - itemWidth;
						break;
						
					default:
						return x_positionNum = 0;
						break;
				}
			}
		},
		
		//set $list style
		setListStyle: function () {
			$list.css({
				width: set.listWidth() + "px",
				marginLeft: set.listMarginLeft() + "px"
			});
		},
		
		//setCloneNum
		setCloneNum: function () {
			var deficiencyItem = Math.ceil(elementWidth / itemWidth);
			clonePrependNum = cloneAppendNum = deficiencyItem;
		},
		
		//roop用のcloneを作成
		makeClone: function () {
			var i, j;
			//既に作成された要素があれば削除
			$list.find($(".mod-topContents-clone")).remove();
			
			//prepend
			for (i = 0, j = $item.length - 1; i < clonePrependNum; i++) {
				$list.prepend($item.clone().addClass(o.cloneClass).removeClass(o.currentClass)[j]);
				(j <= 0)? j = $item.length - 1 : j--;
			}
			
			//append
			for (i = 0, j = 0; i < cloneAppendNum; i++) {
				$list.append($item.clone().addClass(o.cloneClass).removeClass(o.currentClass)[j]);
				(j >= $item.length - 1)? j = 0 : j++;
			}
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
				$controlItem.animate({opacity: 0.4}, {duration: 300, queue: false});
				$controlItem + $("." + o.currentClass).animate({opacity: 1}, {duration: 300, queue: false});
			}
		},
		
		//move前に実行される。currentNumberがアイテムの最大値より大きければ最小値を、最小値より小さければ最大値をセット。
		currentNumberNormalizing: function (moveNum) {
			if (!isMoving){
				if (o.loop) {
					if (moveNum > $item.length){ moveNum = 0; }
					if (moveNum < -1){ moveNum = $item.length - 1; }
				} else {
					if (moveNum > $item.length - 1){ moveNum = 0; }
					if (moveNum < 0){ moveNum = $item.length - 1; }
				}
				currentNumber = moveNum;
			}
		},
		
		//move後に実行される。currentNumberNormalizing よりも最大値・最小値が1少ない値で最大値より大きければ最小値を、最小値より小さければ最大値をセット。
		roopReset: function () {
			if (currentNumber < 0 || currentNumber > $item.length - 1) {
				if (currentNumber < 0) { currentNumber = $item.length - 1; }
				if (currentNumber > $item.length - 1) { currentNumber = 0; }
			}
		},
		
		//[currentNumber] * itemWidth分だけ$listを左にずらす
		move: function () {
			if (!isMoving){
				isMoving = true;
				$list.animate({
					marginLeft: set.listMarginLeft() + "px"
				}, {
					duration: o.speed,
					easing: o.animation,
					complete: function(){
						if (o.loop) {
							set.roopReset();
							set.setListStyle();
						}
						set.addCurrentClass();
						set.highlightEffect();
						isMoving = false;
					},
					queue: false
				})
			}
		},
		
		moveCombo: function (moveNum) {
			set.currentNumberNormalizing(moveNum);
			set.move();
		},
		
		autoPlay: (function () {
			if (o.autoPlay) {
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
			}
		})()
		
		
	}
	
	
	/*-------------------------------------------
	run
	-------------------------------------------*/
	set.currentNumberNormalizing(currentNumber);
	
	if (o.loop) {
		set.setCloneNum();
		set.makeClone();
	}
	
	set.setListStyle();
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
	
	
	//resize
	$(window).on('resize', function () {
		elementWidth = $element.outerWidth(true);
		set.setCloneNum();
		set.makeClone();
		set.setListStyle();
	});
	
}//jqueryLiquidCarousel


})(jQuery, this);
