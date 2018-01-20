var gulp = require('gulp');

const paths = {
  dist: './dist',
  dve: './dev/src/ion2-calendar',
  src: './src'
};


gulp.task('copy-sources', copySources);
gulp.task('copy-scss', copyScss);

function copySources() {
    gulp.src(`${paths.dve}/**/*`)
    .pipe(gulp.dest(paths.src))
}

function copyScss() {
    gulp.src(`${paths.src}/**/*.scss`).pipe(gulp.dest(paths.dist));
}