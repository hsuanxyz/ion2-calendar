var gulp = require('gulp');
var gutil = require('gulp-util');
var replace = require('../index');
var should = require('should');

var fakeFile = function(filename) {
	return new gutil.File({
		path: "fixtures/" + filename,
		base: "fixtures",
		cwd: "test/",
		contents: new Buffer("body { background:#000; }")
	});
};

var testChange = function(options, done) {
	var stream = replace(options.newExt, options.replaceExt || false);
	var file = fakeFile(options.filename);

	stream.on('error', done);

	stream.on('data', function(file) {
		should.exist(file);
		file.path.should.equal('fixtures/' + options.newFilename);
		file.relative.should.equal(options.newFilename);
		done();
	});

	stream.write(file);
};

describe('gulp-file-extension', function() {
	it('should change the extension', function(done) {
		var options = {
			filename: 'styles.scss',
			newFilename: 'styles.css',
			newExt: '.css'
		};

		testChange(options, done);
	});

	it('should change the tricky extension', function(done) {
		var options = {
			filename: 'styles.min.css',
			newFilename: 'styles.min.scss',
			newExt: '.scss'
		};

		testChange(options, done);
	});

	it('should work with custom replace extension', function(done) {
		var options = {
			filename: 'styles.min.css',
			newFilename: 'styles.scss',
			newExt: '.scss',
			replaceExt: '.min.css'
		};

		testChange(options, done);
	});

	it('should not change the extension', function(done) {
		var options = {
			filename: 'styles.css',
			newFilename: 'styles.css',
			newExt: '.css'
		};

		testChange(options, done);
	});

	it('should work with numbers too', function(done) {
		var options = {
			filename: 'styles.mp4',
			newFilename: 'styles.mp3',
			newExt: '.mp3'
		};

		testChange(options, done);
	});

	it('should not blow up with an undefined extension', function(done) {
		var options = {
			filename: 'styles.css',
			newFilename: 'styles.css',
			newExt: undefined
		};

		testChange(options, done);
	});

	it('should not blow up with false as an extension', function(done) {
		var options = {
			filename: 'styles.css',
			newFilename: 'styles.css',
			newExt: false
		};

		testChange(options, done);
	});

	it('should add the missing first period', function(done) {
		var options = {
			filename: 'styles.css',
			newFilename: 'styles.scss',
			newExt: 'scss'
		};

		testChange(options, done);
	});

	it('testing...', function(done) {
		var options = {
			filename: 't1.js.jst',
			newFilename: 't1.js',
			newExt: ''
		};

		testChange(options, done);
	});
});
