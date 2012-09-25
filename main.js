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
	
	,   pos_x: 'center'
	,   index: 1
	,   currentClass: 'mod-topContents-current'
	,   speed: 300
	,   autoPlayInterval: 5000
	,   autoPlayStartDelay: 2000
	
	,   loop: true
	,   currentHighlight: true
	,   autoPlay: false
	,   autoPlayHoverStop: true
	});
});


})(jQuery, this);
