skrollr-stylesheets
===================

*WORK IN PROGRESS*

Allows separation of skrollr keyframes and the document. See https://github.com/Prinzhorn/skrollr for infos on skrollr.


Limitations
-----

skrollr-stylesheets tries to mimic the way normal CSS works in terms of inheritance and order of precedence. Stylesheets which appear lower in the document will have higher precedence, and inline keyframes will have precedence over everything else. That means if you declare the same keyframe with same properties (probably different values) in multiple places, they overwrite each other, just as normal CSS does. **But skrollr-stylesheets is not able to detect which selector has a higher specificity. It only operates on element-level. Thus only the order of rules counts, not the specificity of the selector.**