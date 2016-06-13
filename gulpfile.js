/* eslint-env es6 */

const gulp       = require('gulp')
const uglify     = require('gulp-uglify')
const rename     = require('gulp-rename')
const webpack     = require('gulp-webpack')

const paths = {
	js: './src/dependsOn.js',
	dist: './dist'
}

gulp.task('build', function() {
	gulp.src(paths.js)
		.pipe(webpack())
		.pipe(rename('dependsOn.min.js'))
		.pipe(uglify({ preserveComments: 'some' }))
		.pipe(gulp.dest(paths.dist))
})

gulp.task('default', ['build'])
