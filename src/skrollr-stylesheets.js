/*!
 * skrollr stylesheets.
 * Parses stylesheets and searches for skrollr keyframe declarations.
 * Converts them to data-attributes.
 * Doesn't expose any globals.
 */
(function(window, document, undefined) {
	var stylesheets = document.styleSheets;
	var content;
	var contents = [];
	var animations = {};
	var selectors = [];

	var rxAnimation = /@-skrollr-keyframes\s+(\w+)/;

	var fetchRemote = function(url) {
		var xhr;

		xhr = new XMLHttpRequest();

		try {
			xhr.open('GET', url, false);
			xhr.send(null);
		} catch (e) {
			//Fallback to XDomainRequest if available
			if (window.XDomainRequest !== undefined) {
				xhr = new XDomainRequest();
				xhr.open("GET", url, false);
				xhr.send(null);
			}
		}

		return xhr.responseText;
	};

	//Finds animation declarations and puts them into "animations".
	var parseDeclarations = function(input) {
		rxAnimation.lastIndex = 0;

		var match;

		while((match = rxAnimation.exec(input)) !== null) {
			alert(match);
		}
		alert('lulz');
	/*
    Search for all occurrences of "@-skrollr-keyframes" and grab the animation name
    Use a regex to extract the keyframes starting at the open curly brace after "@-skrollr-keyframes"
    Concat all rules per keyframe (the data-attributes get this as value)
    Put the animations inside an object using their name as key for later lookup
    Put the keyframe inside the animation object using the keyframes as name
    */

	};

	//Finds usage of animations and puts the selectors into "selectors".
	var parseUsage = function(input) {

	};

	//Applies the keyframes (as data-attributes) to the elements.
	var applyKeyframes = function() {

	};

	//Iterate over all stylesheets, embedded and remote.
	for(var stylesheetIndex = 0; stylesheetIndex < stylesheets.length; stylesheetIndex++) {
		var sheet = stylesheets[stylesheetIndex];
		var node = sheet.ownerNode;

		//Ignore alternate stylesheets or those with explicit attribute.
		if((node.tagName === 'LINK' && node.rel !== 'stylesheet') || node.hasAttribute('data-no-skrollr')) {
			continue;
		}

		//Embedded stylesheet, grab the node content.
		if(sheet.href === null) {
			content = node.firstChild.textContent || node.firstChild.innerText;
		}
		//Remote stylesheet, fetch it (synchrnonous).
		else {
			content = fetchRemote(node.href);
		}

		if(content) {
			contents.push(content);
		}
	}

	//Now parse all stylesheets.
	for(var contentIndex = 0; contentIndex < contents.length; contentIndex++) {
		content = contents[contentIndex];

		parseDeclarations(content);

		parseUsage(content);
	}

	//Apply the keyframes to the elements.
	applyKeyframes();
}(window, document));
