/* eslint-env es6 */

const gulp    = require('gulp')
const uglify  = require('gulp-uglify')
const rename  = require('gulp-rename')
const webpack = require('gulp-webpack')
const zip     = require('gulp-zip')
const replace = require('gulp-replace')
const package = require('./package')

const paths = {
	js: './src/dependsOn.js',
	copy: ['./README.md', './LICENSE.md'],
	dist: './dist',
}

gulp.task('build', function() {
	return gulp.src(paths.js)
		.pipe(webpack())
		.pipe(rename('dependsOn.min.js'))
		.pipe(uglify({ preserveComments: 'some' }))
		.pipe(replace('${version}', package.version))
		.pipe(gulp.dest(paths.dist))
})

gulp.task('copy', function() {
	return gulp.src(paths.copy)
		.pipe(gulp.dest(paths.dist))
})

gulp.task('release', ['build', 'copy'], function() {
	gulp.src(paths.dist + '/*')
		.pipe(zip('dependsOn_' + package.version + '.zip'))
		.pipe(gulp.dest('./release'))
})

gulp.task('default', ['build'])
