# gulp-ext-replace

Small gulp 3 plugin to change file extensions.

## Install

```shell
npm install --save-dev gulp-ext-replace
```

## Usage

```javascript
var ext_replace = require('gulp-ext-replace');

gulp.task('change', function() {
  gulp.src('styles/*.css')
      .pipe(ext_replace('.scss'))
      .pipe(gulp.dest('dist'))
});
```

If you have a slightly more involved extension you'd like to replace like `.min.css`, you can tell the plugin to replace that instead of the default behavior by passing in a second variable to `ext_replace` in the following example:

```javascript
gulp.task('change', function() {
  gulp.src('styles/*.css')
      .pipe(ext_replace('.scss', '.min.css'))
      .pipe(gulp.dest('dist'))
});
```


## Testing

Open a terminal in the directory containing `gulp-ext-replace` and then:

```shell
npm install
npm test
```

## Change Log

#### 0.3.0
  - Updated all dependencies
  - Added support for replacing extensions with nothing per issue: [Replace to no extension](https://github.com/tjeastmond/gulp-ext-replace/issues/6)
  - Bumped version number

#### 0.2.0
  - Added ability to specify the extension to be replaced
  - Updated tests to test for `undefined`, `false` or blank extensions
  - Added check for period at beginning of new extension
  - Updated version of dependency `through2`

#### 0.1.0
  - Bug fix: typo in README
  - Bumped version number

#### 0.0.5
  - Initial release


## The License (MIT)
Copyright (c) 2015 TJ Eastmond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
