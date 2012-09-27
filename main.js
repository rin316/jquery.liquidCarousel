/*!
 * main.js
 *
 */



(function ($, window, undefined) {

/**
 * addJsOnClass
 */
var addJsOnClass = (function () {
	var ON_CLASS = 'js-on';
	$('html').addClass(ON_CLASS);
})();


//window load
$(window).load(function(){
	
	/*
	 * color gradation作成
	 */
	$('.carousel-list').each(function () {
		var item = $(this).children();
		var itemLength = item.length;
		
		var colors = [];
		for (var i = 0; i < itemLength; i++){
			var r = 152;
			var g = 190;
			var b = 33;
			//r = Math.round(r * i / itemLength)
			//g = Math.round(g * i / itemLength)
			//b = Math.round(b * i / itemLength)

			r = Math.round(r + ((255-r) * (itemLength - i + 1) / itemLength) * 0.6);
			g = Math.round(g + ((255-g) * (itemLength - i + 1) / itemLength) * 0.6);
			b = Math.round(b + ((255-b) * (itemLength - i + 1) / itemLength) * 0.6);

			colors[itemLength - i] = 'rgb(' + r + ','+ g + ',' + b + ')';
			
			$(item[i]).css('background-color', colors[itemLength - i])
		}
	});
	
	
	/*
	 * liquidCarousel
	 */
	$('#sample1-1').liquidCarousel({
	});
	$('#sample1-2').liquidCarousel({
	    pos_x: 'center'
	,   autoPlayInterval: 2000
	,   autoPlayStartDelay: 0
	,   autoPlay: true
	,   autoPlayHoverStop: true

	});
	$('#sample1-3').liquidCarousel({
	    pos_x: 'right'
	,   easing: 'linear'
	,   speed: 4000
	,   autoPlayInterval: 0
	,   autoPlayStartDelay: 1000
	,   autoPlay: true
	});
	
	$('#sample2-1').liquidCarousel({
	    loop: false
	});
	
	$('#sample2-2').liquidCarousel({
	    loop: false
	,   unit: 3
		
	});
	
	$('#sample3').liquidCarousel({
	    vertical: true
	});
});


})(jQuery, this);
