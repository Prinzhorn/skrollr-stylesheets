/*!
 * skrollr stylesheets.
 * Parses stylesheets and searches for skrollr keyframe declarations.
 * Converts them to data-attributes.
 * Is an AMD module; returns an object that can be called with the
 * skrollr instance when the dom is loaded.
 */
define(function() {
	'use strict';

	var sheets = [];
	var lastCall;
	var resizeThrottle = 30;
	var resizeDefer;
	var skrollr;

	//Finds the declaration of an animation block.
	var rxAnimation = /@-skrollr-keyframes\s+([\w-]+)/g;

	//Finds the block of keyframes inside an animation block.
	//http://regexpal.com/ saves your ass with stuff like this.
	var rxKeyframes = /\s*\{\s*((?:[^{]+\{[^}]*\}\s*)+?)\s*\}/g;

	//Gets a single keyframe and the properties inside.
	var rxSingleKeyframe = /([\w\-]+)\s*\{([^}]+)\}/g;

	//Finds usages of the animation.
	var rxAnimationUsage = /-skrollr-animation-name\s*:\s*([\w-]+)/g;

	var fetchRemote = function(url) {
		var xhr = new XMLHttpRequest();

		/*
		 * Yes, these are SYNCHRONOUS requests.
		 * Simply because skrollr stylesheets should run while the page is loaded.
		 * Get over it.
		 */
		try {
			xhr.open('GET', url, false);
			xhr.send(null);
		} catch (e) {
			//Fallback to XDomainRequest if available
			if (window.XDomainRequest) {
				xhr = new XDomainRequest();
				xhr.open('GET', url, false);
				xhr.send(null);
			}
		}

		return xhr.responseText;
	};

	//"main"
	var kickstart = function(sheetElms, skrollrInstance) {
		//make the provided skrollr instance accessible to other functions
		skrollr = skrollrInstance;

		//Iterate over all stylesheets, embedded and remote.
		for(var sheetElmsIndex = 0; sheetElmsIndex < sheetElms.length; sheetElmsIndex++) {
			var sheetElm = sheetElms[sheetElmsIndex];
			var content;

			if(sheetElm.tagName === 'LINK') {
				if(sheetElm.getAttribute('data-skrollr-stylesheet') === null) {
					continue;
				}

				//Remote stylesheet, fetch it (synchrnonous).
				content = fetchRemote(sheetElm.href);
			} else {
				//Embedded stylesheet, grab the node content.
				content = sheetElm.textContent || sheetElm.innerText || sheetElm.innerHTML;
			}

			if(content) {
				sheets.push({
					'content':content,
					'media': sheetElm.getAttribute('media'),
					'animations': {},
					'selectors': []
				});
			}
		}

		//We take the stylesheets in reverse order.
		//This is needed to ensure correct order of stylesheets and inline styles.
		sheets.reverse();

		//Now parse all stylesheets.
		for(var sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++) {
			content = sheets[sheetIndex].content;

			parseDeclarations(content, sheets[sheetIndex].animations);

			parseUsage(content, sheets[sheetIndex].selectors);
		}

		run(false);
	};

	var run = function(fromResize) {
		var now = (new Date()).getTime();
		var animations;
		var selectors;
		var currentSheet;
		var media;

		if(fromResize && lastCall && now - lastCall < resizeThrottle) {
			window.clearTimeout(resizeDefer);
			resizeDefer = window.setTimeout(run, resizeThrottle);
			return;
		}
		else {
			lastCall = now;
		}

		animations = {};
		selectors  = [];

		for(var sheetIndex = 0, sheetCount = sheets.length; sheetIndex < sheetCount; sheetIndex++) {
			currentSheet = sheets[sheetIndex];
			media = currentSheet.media;

			//find the stylesheets that match the current media query, and apply them.
			if(!matchMedia || !media || matchMedia(media).matches) {
				selectors = selectors.concat(currentSheet.selectors);

				for(var key in currentSheet.animations) {
					if (currentSheet.animations.hasOwnProperty(key)) {
						animations[key] = currentSheet.animations[key];
					}
				}
			}
		}

		//Apply the keyframes to the elements.
		resetSkrollrElements();
		applyKeyframes(animations, selectors);
		skrollr.refresh();
	};

	//Finds animation declarations and puts them into the output map.
	var parseDeclarations = function(input, output) {
		rxAnimation.lastIndex = 0;

		var animation;
		var rawKeyframes;
		var keyframe;
		var curAnimation;

		while((animation = rxAnimation.exec(input)) !== null) {
			//Grab the keyframes inside this animation.
			rxKeyframes.lastIndex = rxAnimation.lastIndex;
			rawKeyframes = rxKeyframes.exec(input);

			//Grab the single keyframes with their CSS properties.
			rxSingleKeyframe.lastIndex = 0;

			//Save the animation in an object using it's name as key.
			curAnimation = output[animation[1]] = {};

			while((keyframe = rxSingleKeyframe.exec(rawKeyframes[1])) !== null) {
				//Put all keyframes inside the animation using the keyframe (like botttom-top, or 100) as key
				//and the properties as value (just the raw string, newline stripped).
				curAnimation[keyframe[1]] = keyframe[2].replace(/[\n\r\t]/g, '');
			}
		}
	};

	//Finds usage of animations and puts the selectors into the output array.
	var parseUsage = function(input, output) {
		rxAnimationUsage.lastIndex = 0;

		var match;
		var begin;
		var end;

		while((match = rxAnimationUsage.exec(input)) !== null) {
			//This match is inside a style declaration.
			//We need to walk backwards to find the selector.

			//First find the curly bracket that opens this block.
			end = rxAnimationUsage.lastIndex;
			while(end-- && input.charAt(end) !== '{') {}

			//Now walk farther backwards until we grabbed the whole selector.
			//This either ends at beginning of string or at end of next block.
			begin = end;
			while(begin-- && input.charAt(begin - 1) !== '}') {}

			//Associate this selector with the animation name.
			output.push([input.substring(begin, end).replace(/[\n\r\t]/g, ''), match[1]]);
		}
	};

	//Applies the keyframes (as data-attributes) to the elements.
	var applyKeyframes = function(animations, selectors) {
		var elements;
		var keyframes;
		var keyframeName;
		var elementIndex;
		var attributeName;
		var attributeValue;
		var curElement;

		for(var selectorIndex = 0; selectorIndex < selectors.length; selectorIndex++) {
			elements = document.querySelectorAll(selectors[selectorIndex][0]);

			if(!elements) {
				continue;
			}

			keyframes = animations[selectors[selectorIndex][1]];

			for(keyframeName in keyframes) {
				for(elementIndex = 0; elementIndex < elements.length; elementIndex++) {
					curElement = elements[elementIndex];
					attributeName = 'data-' + keyframeName;
					attributeValue = keyframes[keyframeName];

					//If the element already has this keyframe inline, give the inline one precedence by putting it on the right side.
					//The inline one may actually be the result of the keyframes from another stylesheet.
					//Since we reversed the order of the stylesheets, everything comes together correctly here.
					if(curElement.hasAttribute(attributeName)) {
						attributeValue += curElement.getAttribute(attributeName);
					}
					curElement.setAttribute(attributeName, attributeValue);
				}
			}
		}
	};

	function resetSkrollrElements() {
		var elements = document.body.querySelectorAll('*');
		var attrArray = [];
		var curElement;

		for(var elementIndex = 0, elementsLength = elements.length; elementIndex < elementsLength; elementIndex++) {
			curElement = elements[elementIndex];

			for(var k = 0; k < curElement.attributes.length; k++) {
				var attr = curElement.attributes[k];

				if(/data-[0-9]+/.test(attr.name)) {
					attrArray.push(attr.name);
				}
			}

			for(k = 0; k < attrArray.length; k++) {
				curElement.removeAttribute(attrArray[k]);
			}
		}
	}

	//adjust on resize
	function resizeHandler() {
		run(true);
	}

	return {
		'init': function(skrollr) {
			//start her up
			kickstart(document.querySelectorAll('link, style'), skrollr);

			if(window.addEventListener) {
				window.addEventListener('resize', resizeHandler, false);
			}

			else if(window.attachEvent) {
				window.attachEvent('onresize', resizeHandler);
			}
		}
	};

});