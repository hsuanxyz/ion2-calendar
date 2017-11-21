var gulp = require('gulp');

var TEMP_PATH = './_temp';
var DIST_PATH = './dist';
var SRC_PATH = './lib/src/components/ion2-calendar';

gulp.task('src2temp', function() {
    gulp.src( SRC_PATH + '/**/**').pipe(gulp.dest(TEMP_PATH));
});

gulp.task('copy-scss', function() {
    gulp.src( TEMP_PATH + '/**/*.scss').pipe(gulp.dest(DIST_PATH));
});

gulp.task('dist2nm', function() {
    gulp.src( DIST_PATH+'/**/**').pipe(gulp.dest('demo/node_modules/ion2-calendar'));
});