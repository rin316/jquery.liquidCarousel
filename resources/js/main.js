/*!
 * main.js
 *
 */



(function ($, window, undefined) {

/**
 * addJsOnClass
 */
var addJsOnClass = function () {
	var ON_CLASS = 'js-on';
	$('html').addClass(ON_CLASS);
};
addJsOnClass();


//window load
$(window).load(function(){
	$('.mod-topContents').liquidCarousel({
		listSelector: '.mod-topContents-visual-list'
	  , itemSelector: '.mod-topContents-visual-item'
	  , controlSelector: '.mod-topContents-controller'
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
	  //, autoPlay: true
	  //, autoInterval: 1000
	});
});


})(jQuery, this);
