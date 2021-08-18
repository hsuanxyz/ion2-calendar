'use strict';

var gulp = require('gulp');
var bump = require('../');

gulp.task('bump', function(){
  var options = {
    type: 'minor'
  };
  gulp.src('./package.json')
  .pipe(bump(options))
  .pipe(gulp.dest('./build'));
});

gulp.task('version', function(){
  gulp.src('./package.json')
  .pipe(bump({version: '1.2.3'}))
  .pipe(gulp.dest('./version'));
});

gulp.task('xml', function(){
  gulp.src('./file.xml')
  .pipe(bump())
  .pipe(gulp.dest('./build'));
});

// WordPress Theme: https://developer.wordpress.org/themes/basics/main-stylesheet-style-css/
gulp.task('wptheme', function(){
  gulp.src('./style.css')
  .pipe(bump())
  .pipe(gulp.dest('./build'));
});

// WordPress Plugin: https://developer.wordpress.org/plugins/the-basics/header-requirements/
gulp.task('wpplugin', function(){
  gulp.src('./plugin.php')
  .pipe(bump())
  .pipe(gulp.dest('./build'));
});

// PHP Constant: `define( 'MY_PLUGIN_VERSION', '1.0.0' );`
gulp.task('phpconstant', function(){
  var constant = "MY_PLUGIN_VERSION";
  gulp.src('./plugin.php')
  .pipe(bump({
    key: constant, // for error reference
    regex: new RegExp('([<|\'|"]?(' + constant + ')[>|\'|"]?[ ]*[:=,]?[ ]*[\'|"]?[a-z]?)(\\d+.\\d+.\\d+)(-[0-9A-Za-z.-]+)?(\\+[0-9A-Za-z\\.-]+)?([\'|"|<]?)', 'i')
  }))
  .pipe(gulp.dest('./build'));
});

gulp.task('key', function(){
  gulp.src('./key.json')
  .pipe(bump({key: 'appversion'}))
  .pipe(gulp.dest('./build'));
});

gulp.task('patch', function(){
  gulp.src('./package.json')
  .pipe(bump())
  .pipe(gulp.dest('./build'));
});

gulp.task('default', ['bump']);
