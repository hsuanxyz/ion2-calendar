var gulp = require('gulp');

var SRC_PATH = 'src/';
var DIST_PATH = 'dist';

gulp.task('copy-scss', function() {
    gulp.src( SRC_PATH + '**/*.scss').pipe(gulp.dest(DIST_PATH));
});