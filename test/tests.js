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

test('External stylesheets with Wrapped Comment inside Selector', function() {
	var comment = $('#commentInsideSelectorWrapped');

	equal(comment.attr('data-0'), undefined, '#commentInsideWrapped 0');
	equal(comment.attr('data-100'), undefined, '#commentInsideWrapped 100');
});

test('External stylesheets with Line Comment inside Selector', function() {
	var comment = $('#commentInsideSelectorLine');

	equal(comment.attr('data-0'), undefined, '#commentInsideLine 0');
	equal(comment.attr('data-100'), undefined, '#commentInsideLine 100');
});

test('External stylesheets with Selector Commentet', function() {
	var comment = $('#commentOutsideSelectorWrapped');

	equal(comment.attr('data-0'), undefined, '#commentOutsideWrapped 0');
	equal(comment.attr('data-100'), undefined, '#commentOutsideWrapped 100');
});

test('External stylesheets with Selector as Line Commentet', function() {
	var comment = $('#commentOutsideSelectorLine');

	equal(comment.attr('data-0'), undefined, '#commentOutsideLine 0');
	equal(comment.attr('data-100'), undefined, '#commentOutsideLine 100');
});

test('Inline stylesheets Comment', function() {
	var comment = $('#commentInline');

	equal(comment.attr('data-0'), undefined, '#commentOutsideLine 0');
	equal(comment.attr('data-100'), undefined, '#commentOutsideLine 100');
});