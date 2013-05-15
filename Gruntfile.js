module.exports = function(grunt) {
	//Configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json') ,
		jshint: {
			options: {
				smarttabs: false,
				curly: true,
				immed: true,
				latedef: true,
				noarg: true,
				quotmark: 'single',
				undef: true,
				unused: true,
				strict: true,
				trailing: true,
				globals: {
					window: true,
					document: true,
					navigator: true,
					XMLHttpRequest: true,
					XDomainRequest: true,
					matchMedia: true
				}
			},
			all: ['src/**/*.js']
		},
		qunit: {
			all: ['test/index.html']
		},
		uglify: {
			options: {
				banner: '/*! skrollr-stylesheets <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) | Alexander Prinzhorn - https://github.com/Prinzhorn/skrollr-stylesheets | Free to use under terms of MIT license */\n'
			},

			all: {
				files: {
					'dist/skrollr.stylesheets.min.js': ['src/skrollr.stylesheets.js'],
				}
			}
		}
	});

	//Dependencies.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	//Tasks.
	grunt.registerTask('default', ['jshint', 'qunit', 'uglify']);
	grunt.registerTask('travis', ['jshint', 'qunit']);
};