skrollr-stylesheets (v 0.0.1, yes, it's _that_ hot)
===================

Allows separation of skrollr keyframes and the document by putting them inside your stylesheets, in **under 1kb** (minified + gzipped). Works in all browsers including IE8+.

See https://github.com/Prinzhorn/skrollr for infos on skrollr.

Documentation
=====

This is a completely separate project. skrollr-stylesheets does not depend on skrollr in any way. It parses all your stylesheets (`<link>` and `<style>` elements) and adds the information to the document as skrollr compatible data-attributes.

When I say "parsing" I mean it's using regular expressions. Thus you should avoid doing funky stuff inside your CSS files (actually, comments at the wrong place could break the current version). Just put all skrollr related things in one file and keep it clean.

skrollr-stylesheets borrows it's syntax from CSS animations and uses it's own `-skrollr` prefix. Here's an example which should explain everything to get you started with skrollr-stylesheets.

This HTML

```html
<div id="foo"></div>
```

together with this CSS (inside any `<style>` or `<link>`)

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

In order to use skrollr-stylesheets just put `dist/skrollr-stylesheets.min.js` in your document **below all stylesheets** you want to get considered. skrollr-stylesheets will execute right when it's included and searches for all stylesheets and processes them synchronously.

skrollr-stylesheets doesn't expose or expect any globals (well, except for `window` and `document`, duh). You don't need to do anything but include the script.


Prevent parsing
-----

If you want to ignore certain CSS files or help skrollr-stylesheets decide which stylesheets to ignore, add an empty `data-no-skrollr` attribute to the `<style>` or `<link>` element and skrollr-stylesheets will ignore the stylesheet.


SASS
-----

The above is already pretty awesome, but it gets even better. If you know skrollr, you probably heard about the _constants_ feature. Let's admit it: it does it's job, but it's ugly.

(SASS)[http://sass-lang.com/] to the rescue! Using SASS variables and interpolation, things can now look like this:

```scss
$about_section_begin: 0;
$about_section_duration: 2000;
$about_section_end: $about_section_begin + $about_section_duration;

@-skrollr-keyframes animation1 {
	#{$about_section_begin} {
		left:100%;
	}

	#{$about_section_end} {
		left:0%;
	}
}
```

\*_mind blown_\*

And of course you can use all the things you already love about SASS as well.


Limitations
=====

skrollr-stylesheets tries to mimic the way normal CSS works in terms of inheritance and order of precedence. Stylesheets which appear lower in the document will have higher precedence, and inline keyframes will have precedence over everything else. That means if you declare the same keyframe with same properties (probably different values) in multiple places, they overwrite each other, just as normal CSS does. **But skrollr-stylesheets is not able to detect which selector has a higher specificity. It only operates on element-level. Thus only the order of rules counts, not the specificity of the selector.**

Changelog
=====

0.0.1
-----

* Initial "release". Features a reasonable amount of tests to at least let people play with it.