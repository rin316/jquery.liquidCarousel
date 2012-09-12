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
	$('.mod-topContents').liquidCarousel({
		listSelector: '.mod-topContents-visual-list'
	  , itemSelector: '.mod-topContents-visual-item'
	  , controlListSelector: '.mod-topContents-controller-list'
	  , controlItemSelector: '.mod-topContents-controller-item'
	  , prevSelector: '.mod-topContents-prev'
	  , nextSelector: '.mod-topContents-next'
	  , x_position: 'center'
	  , loop: true
	  , speed: 300
	  , currentClass: 'mod-topContents-current'
	  , currentHighlight: true
	  , currentNumber: 1
	  , autoPlay: true
	  , autoPlayInterval: 5000
	  , autoPlayStartDelay: 2000
	});
});


})(jQuery, this);
