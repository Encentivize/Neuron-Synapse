'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul');

var jsPath = ['./lib/**/*.js'],
    testsPath = ['./test/**/*.tests.js'];

gulp.task('lint', function () {
    return gulp.src(jsPath)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('tests', function () {
    return gulp.src(jsPath)
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(testsPath, {
                    read: false
                })
                .pipe(mocha({
                    reporter: 'nyan'
                }))
                .pipe(istanbul.writeReports());
        });
});

gulp.task('default', ['lint', 'tests']);

gulp.task('watch', ['lint', 'tests'], function () {
    gulp.watch(jsPath, ['lint', 'tests']);
});
