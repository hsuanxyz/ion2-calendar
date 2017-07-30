var gulp = require('gulp');

var SRC_PATH = './src';
var DIST_PATH = './dist';
var DEV_PATH = './dev/src/components/ion2-calendar';

gulp.task('dev2src', function() {
    gulp.src( DEV_PATH + '/**/**').pipe(gulp.dest(SRC_PATH));
});

gulp.task('copy-scss', function() {
    gulp.src( SRC_PATH + '/**/*.scss').pipe(gulp.dest(DIST_PATH));
});

gulp.task('dist2nm', function() {
    gulp.src( DIST_PATH+'/**/**').pipe(gulp.dest('demo/node_modules/ion2-calendar'));
});