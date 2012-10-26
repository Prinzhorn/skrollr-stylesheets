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

	//Finds the declaration of an animation block.
	var rxAnimation = /@-skrollr-keyframes\s+(\w+)/g;

	//Finds the block of keyframes inside an animation block.
	//http://regexpal.com/ saves your ass with stuff like this.
	var rxKeyframes = /\s*\{\s*((?:[^{]+\{[^}]*\}\s*)+?)\s*\}/g;

	//Gets a single keyframe and the properties inside.
	var rxSingleKeyframe = /([\w\-]+)\s*\{([^}]+)\}/g;

	var fetchRemote = function(url) {
		var xhr = new XMLHttpRequest();

		try {
			xhr.open('GET', url, false);
			xhr.send(null);
		} catch (e) {
			//Fallback to XDomainRequest if available
			if (window.XDomainRequest) {
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
			curAnimation = animations[animation[1]] = {};

			while((keyframe = rxSingleKeyframe.exec(rawKeyframes[1])) !== null) {
				//Put all keyframes inside the animation using the keyframe (like botttom-top, or 100) as key
				//and the properties as value (just the raw string, newline stripped).
				curAnimation[keyframe[1]] = keyframe[2].replace(/[\n\r\t]/g, '');
			}
		}

		console.log(animations);
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

		//Ignore alternate stylesheets or those who should explicitly be ignored using data-no-skrollr.
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
