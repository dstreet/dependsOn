var gulp = require('gulp')
	, uglify = require('gulp-uglify')
	, rename = require('gulp-rename')
	, dir = {
		js: './src/**/*.js',
		dist: './dist'
	};

gulp.task('build', function() {
	gulp.src(dir.js)
		.pipe(uglify({ preserveComments: 'some' }))
		.pipe(rename('dependsOn.min.js'))
		.pipe(gulp.dest(dir.dist));
});

gulp.task('default', ['build']);