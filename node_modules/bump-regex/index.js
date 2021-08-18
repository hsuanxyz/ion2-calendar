'use strict';

var semver = require('semver');

module.exports = function(options, cb) {
  if (typeof options === 'string') {
    options = {
      str: options
    }
  }

  var defaultOpts = {
    key: 'version',
    type: 'patch',
    case: false,
    keys: null,
    keepmetadata: false
  }

  var opts = Object.assign({}, defaultOpts, options);

  var keyRegex = opts.key

  if (opts.keys) {
    keyRegex = opts.keys.join('|');
  }

  var regex = opts.regex || new RegExp(
    [
      // Match Key, e.g. "key": " OR 'key': ' OR <key>
      '([<|\'|\"]?(',
      keyRegex,
      ')[>|\'|\"]?[ ]*[:=]?[ |>|\(]*[\'|\"]?[a-z]?)',

      // Match Semver version identifier, e.g.: x.y.z
      '(\\d+\\.\\d+\\.\\d+)',

      // Match Semver pre-release identifier, e.g. -pre.0-1
      '(-[0-9A-Za-z\.-]+)?',

      // Match Semver metadata identifier, e.g. +meta.0-1
      '(\\+[0-9A-Za-z\.-]+)?',

      // Match end of version value: e.g. ", ', <
      '([\'|\"|<|\)]?)'
    ].join(''), + opts.case ? '' : 'i'
  );

  if (opts.global || (opts.keys && opts.keys.length > 1)) {
    regex = new RegExp(regex.source, 'gi');
  }

  var parsedOut;
  opts.str = opts.str.replace(regex, function(match, prefix, key, parsed, prerelease, metadata, suffix) {

    parsed = parsed + (prerelease || '')
    parsedOut = parsed;
    if (!semver.valid(parsed) && !opts.version) {
      return cb('Invalid semver ' + parsed);
    }
    var version = opts.version || semver.inc(parsed, opts.type, opts.preid);
    opts.prev = parsed;
    opts.new = version;

    if (opts.version) {
      opts.type = semver.diff(opts.prev, opts.new);
    }

    if (!opts.keepmetadata || !!opts.version) {
      metadata = '';
    }

    return prefix + version + (metadata || '') + (suffix || '');
  });

  if (!parsedOut) {
    return cb('Invalid semver: version key "' + opts.key + '" is not found in file');
  }

  return cb(null, opts);
};
