var gulp = require('gulp');

var TEMP_PATH = './.tmp';
var DIST_PATH = './dist';
var SRC_PATH = './src';

gulp.task('src2temp', function() {
    gulp.src( SRC_PATH + '/**/**').pipe(gulp.dest(TEMP_PATH));
});

gulp.task('copy-scss', function() {
    gulp.src( SRC_PATH + '/**/*.scss').pipe(gulp.dest(DIST_PATH));
});

gulp.task('dist2nm', function() {
    gulp.src( DIST_PATH+'/**/**').pipe(gulp.dest('demo/node_modules/ion2-calendar'));
});