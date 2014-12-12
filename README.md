skrollr-stylesheets 1.0.0
=========================

Allows separation of skrollr keyframes and the document by putting them inside your stylesheets, in **under 1kb** (minified + gzipped). Works in all browsers including IE8+.

See https://github.com/Prinzhorn/skrollr for infos on skrollr.

Documentation
=====

This is a completely separate project. skrollr-stylesheets does not depend on skrollr in any way. It parses your stylesheets (`link` and `style` elements) and adds the information to the document as skrollr compatible data-attributes. After skrollr-stylesheets did it's job, you can use skrollr the way you're used to, just as if you had put the data-attributes on the elements manually.

When I say "parsing" I mean it's using regular expressions. Thus you should avoid doing funky stuff inside your CSS files (actually, comments at the wrong place could break the current version). Just put all skrollr related things in one file and keep it clean.

skrollr-stylesheets borrows it's syntax from CSS animations and uses it's own `-skrollr` prefix. Here's an example which should explain everything to get you started with skrollr-stylesheets.

This HTML

```html
<div id="foo"></div>
```

together with this CSS (inside any `style` or `link`)

```css
#foo {
	-skrollr-animation-name:animation1;
}

@-skrollr-keyframes animation1 {
	0 {
		left:100%;
	}

	2000 {
		left:0%;
	}

	/*Same as*/
	skrollr-2000 {
		left:0%;
	}

	top {
		color:rgb(0,0,0);
	}

	bottom {
		color:rgb(255,0,0);
	}
}
```

results in this HTML

```html
<div id="foo" data-0="left:100%;" data-2000="left:0%;" data-top="color:rgb(0,0,0);" data-bottom="color:rgb(255,0,0);"></div>
```

You can use any CSS selector you want because we are using `document.querySelectorAll`. And you can even have multiple declarations affect the same element. The lower they appear inside the stylesheet(s), the higher their priority gets.


The script
-----

In order to use skrollr-stylesheets, just place `dist/skrollr.stylesheets.min.js` at the bottom of your page before the closing `</body>` (but before skrollr itself). skrollr-stylesheets will execute right when it's included and searches for all stylesheets and processes them synchronously.

skrollr-stylesheets doesn't expose or expect any globals (well, except for `window` and `document`, duh). You don't need to do anything but include the script.


External stylesheets
-----

If you want skrollr-stylesheets to parse an external stylesheet (those using a `link` element), add an empty `data-skrollr-stylesheet` attribute to it.

skrollr-stylesheets ignores external (`<link>`) stylesheets unless they have the `data-skrollr-stylesheet` attribute. For example you wouldn't want the Bootstrap or jQuery UI stylesheet to be searched, since there are no keyframes anyway. Internal/embedded stylesheets (`<style>`) are always parsed (they're usually used only in dev anyway).

Example

```html
<link rel="stylesheet" type="text/css" href="style.css" data-skrollr-stylesheet />
```

**Heads up:** Since external stylesheets are fetched using AJAX (more like SJACSS, but that's not the point here) the same origin policy applies which prohibits AJAX requests when viewing files using the `file://` protocol. Either fire up a local server (e.g. `npm install http-server -g && http-server` or `php -S localhost:8080`) or start Chrome using `google-chrome --disable-web-security`.

Attributes
----------

Apart from keyframes skrollr also uses attributes for other things, for examaple `data-anchor-target`. In order to set attributes from within your stylesheet, just do this:

```css
#foo {
	-skrollr-anchor-target: '#bar';
}
```

which results in

```html
<div id="foo" data-anchor-target="#bar"></div>
```

Supported attributes are: `data-anchor-target`, `data-smooth-scrolling`, `data-emit-events`, and `data-menu-offset`.


Media queries
-----

You **cannot** use media queries inside your stylesheets. Parsing those would add another level of complexity to the code. Further more this would not fit the current philosophy of skrollr-stylesheets, which is to parse and apply the keyframes once on page load and then do nothing. Media queries would need to be evaluated at each `resize` and `orientationchange`.

But wait! You **can** use the `media` attribute on external stylesheets. But bare in mind that they are only evaluated once at page load.

Example

```html
<link rel="stylesheet" type="text/css" href="style-large.css" media="only screen and (min-width: 1050px)" data-skrollr-stylesheet />
```

This feature relies on [window.matchMedia](https://developer.mozilla.org/en-US/docs/DOM/window.matchMedia). There is a [matchMedia polyfill](https://github.com/paulirish/matchMedia.js) available that can be used with older browsers. Look at [http://caniuse.com/#search=matchmedia](http://caniuse.com/#search=matchmedia) for browser compatibility.

Sass
-----

The above is already pretty awesome, but it gets even better. If you know skrollr, you probably heard about the _constants_ feature. Let's admit it: it does it's job, but it's ugly.

[Sass](http://sass-lang.com/) to the rescue! Using Sass variables and interpolation, things can now look like this:

```scss
$about_section_begin: 0;
$about_section_duration: 2000;
$about_section_end: $about_section_begin + $about_section_duration;

@-skrollr-keyframes animation1 {
	skrollr-#{$about_section_begin} {
		left:100%;
		opacity#{"[swing]"}: 0.0;
	}

	skrollr-#{$about_section_end} {
		left:0%;
		opacity: 1.0;
	}
}
```

_\*mind blown\*_

And of course you can use all the things you already love about Sass as well.

Note that I used the `skrollr-` prefix in front of the numbers. That's because starting with Sass 3.4 identifiers starting with a number don't compile anymore (as they're invalid CSS).

Note that easing functions need to be interpolated as strings in Sass because of the non-standard syntax.


Limitations
=====

skrollr-stylesheets does not react to changes in the document. The stylesheets are parsed once and then applied. You can't add a class to an element and expect the keyframes to get updated.

skrollr-stylesheets tries to mimic the way normal CSS works in terms of inheritance and order of precedence. Stylesheets which appear lower in the document will have higher precedence, and inline keyframes will have precedence over everything else. That means if you declare the same keyframe with same properties (probably different values) in multiple places, they overwrite each other, just as normal CSS does. **But skrollr-stylesheets is not able to detect which selector has a higher specificity. It only operates on element-level. Thus only the order of rules counts, not the specificity of the selector.**

Changelog
=====

1.0.0 (2014-12-12)
------------------

* Allow keyframes to be prefixed with `skrollr-` to avoid SASS issues (#47).

0.0.6 (2014-05-28)
------------------

* Added `data-menu-offset` to the list of attributes (#41).

0.0.5 (2014-04-30)
------------------

* Attributes likes `data-anchor-target` can now be set as well (#10).

0.0.4 (2013-05-27)
------------------

* Allow dashes in animation names just like in CSS animations (#18)

0.0.3 (2013-05-15)
------------------

* Added support for `media` attribute on external stylesheets.

0.0.2 (2013-04-12)
------------------

* Fixed several issues with IE.
* **breaking**: The logic of `data-no-skrollr` has been inversed. The attribute has been removed. Instead add `data-skrollr-stylesheet` to explicitly parse this external stylesheet.

0.0.1
-----

* Initial "release". Features a reasonable amount of tests to at least let people play with it.