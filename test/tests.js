$(window).on('load', function() {


test('All attributes are there', function() {
	var foo = $('#foo');
	var bar = $('#bar');

	equal(foo.attr('data-bottom-top'), 'left:100%;', 'bottom-top');
	equal(foo.attr('data-top-bottom'), 'left:0%;', 'top-bottom');
});


});//DOM ready
