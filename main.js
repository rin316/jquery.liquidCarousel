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
	,   itemSelector: '.mod-topContents-visual-item'
	,   paginationListSelector: '.mod-topContents-controller-list'
	,   paginationItemSelector: '.mod-topContents-controller-item'
	,   prevSelector: '.mod-topContents-prev'
	,   nextSelector: '.mod-topContents-next'
	,   x_position: 'center'
	,   loop: false
	,   speed: 300
	,   currentClass: 'mod-topContents-current'
	,   currentHighlight: true
	,   index: 1
	,   autoPlay: false
	,   autoPlayInterval: 5000
	,   autoPlayStartDelay: 2000
	,   autoPlayHoverStop: true
	});
});


})(jQuery, this);
