const gulp = require('gulp');
const bump = require('gulp-bump');

const paths = {
  dist: './dist',
  dve: './dev/src/ion2-calendar',
  src: './src'
};


gulp.task('copy-sources', copySources);
gulp.task('copy-scss', copyScss);
gulp.task('bump', bumpVersions);

function bumpVersions(options) {
  return gulp.src([ './package.json'], {base: './'})
  .pipe(bump(options))
  .pipe(gulp.dest('./'));
}

function copySources() {
    gulp.src(`${paths.dve}/**/*`)
    .pipe(gulp.dest(paths.src))
}

function copyScss() {
    gulp.src(`${paths.src}/**/*.scss`).pipe(gulp.dest(paths.dist));
}
