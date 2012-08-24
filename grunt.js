module.exports = function(grunt) {

	//Project configuration.
	grunt.initConfig({
		lint: {
			all: ['src/skrollr-stylesheets.js']
		},
		server: {
			port: 8081,
			base: 'test'
		},
		qunit: {
			//Test file protocol and http
			index: ['test/index.html', 'http://localhost:8081/index.html']
		},
		min: {
			core: {
				src: ['src/skrollr-stylesheets.js'],
				dest: 'dist/skrollr-stylesheets.min.js'
			}
		},
		//We're using concat to add the banner comments
		concat: {
			core: {
				src: ['src/banner.txt', 'dist/skrollr-stylesheets.min.js'],
				dest: 'dist/skrollr-stylesheets.min.js'
			}
		},
		jshint: {
			options: {
				smarttabs: true
			}
		}
	});

	//Default task.
	grunt.registerTask('default', 'lint server qunit min concat');
};
