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
	var lastMatchingStylesheetsKey = '';
	var processedMatchingStylesheetsKeys = {};
	var ssPrefix = 'ss';

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
		for(var i = 0, len = sheetElms.length; i < len; i++) {
			var sheetElm = sheetElms[i];
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
		var matchingStylesheetsKey;

		if(fromResize && lastCall && now - lastCall < resizeThrottle) {
			window.clearTimeout(resizeDefer);
			resizeDefer = window.setTimeout(run, resizeThrottle);
			return;
		}
		else {
			lastCall = now;
		}

		matchingStylesheetsKey = getMatchingStylesheetsKey(sheets);

		//the active stylesheets have changed, so we have to do something.
		if(matchingStylesheetsKey !== lastMatchingStylesheetsKey) {

			resetSkrollrElements();

			//if we haven't seen this set of matching stylesheets before,
			//we need to save the keyframes into the dom for future reference.
			if(!processedMatchingStylesheetsKeys[matchingStylesheetsKey]) {
				saveKeyframesToDOM(sheets, matchingStylesheetsKey);
				processedMatchingStylesheetsKeys[matchingStylesheetsKey] = true;
			}

			//Apply the keyframes to the elements.
			applyKeyframes(matchingStylesheetsKey);
			skrollr.refresh();
		}
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
	var applyKeyframes = function(matchingStylesheetsKey) {
		var attrName = 'data-'+ ssPrefix + '-'+ matchingStylesheetsKey;
		var elements = document.querySelectorAll('['+attrName+']');
		var keyframeData;

		for(var i=0, len = elements.length; i < len; i++) {
			keyframeData = JSON.parse(elements[i].getAttribute(attrName)) || {};

			for(var keyframeName in keyframeData) {
				elements[i].setAttribute('data-' + keyframeName, keyframeData[keyframeName]);
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

	function saveKeyframesToDOM(sheets, matchingStylesheetsKey) {
		var selectors = [];
		var animations = {};
		var attrName = 'data-'+ ssPrefix + '-' + matchingStylesheetsKey;
		var curSheet;
		var curSelector;
		var elements;
		var curElement;
		var curData;
		var keyframes;
		var keyframeName;

		for(var i = 0, len = sheets.length; i < len; i++) {
			curSheet = sheets[i];

			//find the stylesheets that match the current media query, and apply them.
			if(matchingStylesheetsKey.charAt(i)=='1') {
				selectors = selectors.concat(curSheet.selectors);

				for(var key in curSheet.animations) {
					if (curSheet.animations.hasOwnProperty(key)) {
						animations[key] = curSheet.animations[key];
					}
				}
			}
		}

		for(var j = 0, len2 = selectors.length; j < len2; j++) {
			curSelector = selectors[j];
			elements = document.querySelectorAll(curSelector[0]);

			if(!elements) {
				continue;
			}

			keyframes = animations[curSelector[1]];

			for(var k = 0, len3 = elements.length; k < len3; k++) {
				curElement = elements[k];
				curData = JSON.parse(curElement.getAttribute(attrName) || '{}');

				for(keyframeName in keyframes) {
					//add a semicolon onto the end to make sure we can append more properties later without corruption
					if(keyframes[keyframeName].charAt(keyframes[keyframeName].length - 1) != ';') {
						keyframes[keyframeName] += ';';
					}

					//If the element already has this keyframe inline, give the inline one precedence by putting it on the right side.
					//The inline one may actually be the result of the keyframes from another stylesheet.
					//Since we reversed the order of the stylesheets, everything comes together correctly here.
					if(curData[keyframeName]) {
						curData[keyframeName] = keyframes[keyframeName] + curData[keyframeName];
					}
					else {
						curData[keyframeName] = keyframes[keyframeName];
					}
				}

				curElement.setAttribute(attrName, JSON.stringify(curData));
			}
		}
	}

	function getMatchingStylesheetsKey(sheets) {
		var key = '';
		var currentSheet;

		if(!matchMedia) {
			return strRepeat('1', sheets.length);
		}

		else {
			for(var i = 0, len = sheets.length; i < len; i++) {
				currentSheet = sheets[i];
				key = key.concat(!currentSheet.media || matchMedia(currentSheet.media).matches ? '1' : '0');
			}
		}

		return key;
	}

	function strRepeat(pattern, count) {
		var result = '';

		if (count < 1) {
			return result;
		}

		while (count > 0) {
			if (count & 1) {
				result += pattern;
			}
			count >>= 1, pattern += pattern;
		}
		return result;
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