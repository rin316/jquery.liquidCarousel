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
	$('.carousel1').liquidCarousel({
		listSelector:           '.list'
	,   itemSelector:           '.item'
	,   paginationListSelector: '.paginationList'
	,   paginationItemSelector: '.paginationItem'
	,   prevSelector:           '.prev'
	,   nextSelector:           '.next'
	,   pos_x: 'left'
	,   start: 2
	,   currentClass: 'current'
	,   speed: 300
	,   autoPlayInterval: 5000
	,   autoPlayStartDelay: 2000
	,   loop: true
	,   vertical: false
	,   currentHighlight: true
	,   autoPlay: false
	,   autoPlayHoverStop: true
	});
	
	console.log('end 1');
	
	$('.carousel2').liquidCarousel({
		listSelector:           '.list'
	,   itemSelector:           '.item'
	,   paginationListSelector: '.paginationList'
	,   paginationItemSelector: '.paginationItem'
	,   prevSelector:           '.prev'
	,   nextSelector:           '.next'
	,   pos_x: 'left'
	,   start: 1
	,   currentClass: 'current'
	,   speed: 300
	,   autoPlayInterval: 5000
	,   autoPlayStartDelay: 2000
	,   loop: false
	,   vertical: true
	,   currentHighlight: true
	,   autoPlay: false
	,   autoPlayHoverStop: true
	});
	console.log('end 2');
});


})(jQuery, this);
