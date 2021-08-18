'use strict';

// dependencies
var through = require('through2');
var path = require('path');

module.exports = function(ext, replaceExt) {
	var extension_replace = function(file, encoding, callback) {
		replaceExt = replaceExt || false;

		if (typeof ext === 'string') {
 			ext = ext.indexOf('.') === 0 || ext.length === 0 ? ext : '.' + ext;
			file.path = file.path.replace(replaceExt ? replaceExt : path.extname(file.path), ext);
		}

		callback(null, file);
	};

	return through.obj(extension_replace);
};
