var gulp = require('gulp');

var SRC_PATH = 'src/';
var DIST_PATH = 'dist';

gulp.task('copy-scss', function() {
    gulp.src( SRC_PATH + '**/*.scss').pipe(gulp.dest(DIST_PATH));
});

gulp.task('dist2nm', function() {
    gulp.src( DIST_PATH+'**/**').pipe(gulp.dest('demo/node_modules/ion2-calendar'));
});