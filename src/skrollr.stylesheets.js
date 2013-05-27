/*!
 * skrollr stylesheets.
 * Parses stylesheets and searches for skrollr keyframe declarations.
 * Converts them to data-attributes.
 * Doesn't expose any globals.
 */
(function(window, document, undefined) {
	'use strict';

	var content;
	var contents = [];

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
	var kickstart = function(stylesheets) {
		//Iterate over all stylesheets, embedded and remote.
		for(var stylesheetIndex = 0; stylesheetIndex < stylesheets.length; stylesheetIndex++) {
			var sheet = stylesheets[stylesheetIndex];

			if(sheet.tagName === 'LINK') {
				if(sheet.getAttribute('data-skrollr-stylesheet') === null) {
					continue;
				}

				//Test media attribute if matchMedia available.
				if(window.matchMedia) {
					var media = sheet.getAttribute('media');

					if(media && !matchMedia(media).matches) {
						continue;
					}
				}

				//Remote stylesheet, fetch it (synchrnonous).
				content = fetchRemote(sheet.href);
			} else {
				//Embedded stylesheet, grab the node content.
				content = sheet.textContent || sheet.innerText || sheet.innerHTML;
			}

			if(content) {
				contents.push(content);
			}
		}

		//We take the stylesheets in reverse order.
		//This is needed to ensure correct order of stylesheets and inline styles.
		contents.reverse();

		var animations = {};
		var selectors = [];

		//Now parse all stylesheets.
		for(var contentIndex = 0; contentIndex < contents.length; contentIndex++) {
			content = contents[contentIndex];

			parseDeclarations(content, animations);

			parseUsage(content, selectors);
		}

		//Apply the keyframes to the elements.
		applyKeyframes(animations, selectors);
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

					elements[elementIndex].setAttribute(attributeName, attributeValue);
				}
			}
		}
	};

	kickstart(document.querySelectorAll('link, style'));
}(window, document));
