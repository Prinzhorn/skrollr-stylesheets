test('Elements with ID selector', function() {
	var simple1 = $('#simple1');
	var simple2 = $('#simple2');

	equal(simple1.attr('data-bottom-top'), 'left:100%;top:0%;', '#simple1 bottom-top');
	equal(simple1.attr('data-top-bottom'), 'left:0%;top:100%;', '#simple1 top-bottom');

	equal(simple2.attr('data-top'), 'margin:0px;color:rgb(0,0,0);', '#simple2 top');
	equal(simple2.attr('data-bottom'), 'margin:100px;color:rgb(255,255,255);', '#simple2 bottom');
});

test('Elements with complex selectors', function() {
	var complex1 = $('#complex1');

	equal(complex1.attr('data-0'), 'left:0px;', '#complex1 0');
	equal(complex1.attr('data-100'), 'left:100px;', '#complex1 100');
});

test('External stylesheets', function() {
	var external = $('#external');

	equal(external.attr('data-0'), 'bottom:0px;', '#external 0');
	equal(external.attr('data-100'), 'bottom:100px;', '#external 100');
});

test('Ignore data-no-skrollr', function() {
	var ignore = $('#ignore');

	equal(ignore.attr('data-0'), 'left:0px;', '#ignore 0');
	equal(ignore.attr('data-100'), 'left:100px;', '#ignore 100');
});

test('Precedence of rules (order of stylesheets inside of the document)', function() {
	var precedence = $('#precedence');

	equal(precedence.attr('data-0'), 'top:1337px;top:0px;', '#precedence 0');
	equal(precedence.attr('data-100'), 'top:100px;', '#precedence 100');
	equal(precedence.attr('data-200'), 'top:200px;', '#precedence 200');
});

test('Inline rules them all', function() {
	var inline = $('#inline');

	equal(inline.attr('data-0'), 'top:1337px;top:0px;', '#inline 0');
});

test('Stylesheet with media attribute', function() {
	var media = $('#media');

	equal(media.attr('data-0'), 'left:100px;', '#media 0');
	equal(media.attr('data-100'), 'left:200px;', '#media 100');
});

test('Adding attributes like data-anchor-target', function() {
	var external = $('#external');

	equal(external.attr('data-anchor-target'), '.dynamic-anchor > .target', '#external[anchor-target]');
});

test('Class attributes without trailing spaces', function() {
	var media = $('#semi-colons');

	equal(media.attr('data-0'), 'left: 1px;top: 1px;', '#semi-colons 0');
});

test('Stylesheet with multiple @-skrollr-keyframes and no trailing spaces', function() {
	var mk = $('#multiple-keyframes');

  /*
  When the two 0 keyframes are combined from the
  two examples you end up with this:

    0{left:100px;bottom:100pxright:100px;top:100px;}

	The order of the attributes are still wrong, based on precedence,
	but at least they are not broken.. (see next test)
  */

	equal(mk.attr('data-0'), 'left:100px;bottom:100px;right:100px;top:100px;', '#multiple-keyframes 0');
	equal(mk.attr('data-100'), 'left:0px;bottom:0px;right:0px;top:0px;', '#multiple-keyframes 100');
	equal(mk.attr('data-1000'), 'left:-100px;bottom:-100px;', '#multiple-keyframes 1000');
});

test('External stylesheet precedence', function() {
	var mk = $('#multiple-keyframes');

  /*
  When two matching keyframes are combined from the
  same stylesheet, the precedence is incorrect, because
  the contents are reversed. So the external stylesheets
  are not in the correct order..
  */

	equal(mk.attr('data-0'), 'right:100px;top:100px;left:100px;bottom:100px;', '#multiple-keyframes 0');
	equal(mk.attr('data-100'), 'right:0px;top:0px;left:0px;bottom:0px;', '#multiple-keyframes 100');
	equal(mk.attr('data-1000'), 'left:-100px;bottom:-100px;', '#multiple-keyframes 1000');
});
