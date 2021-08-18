'use strict';

var extension = Object.create(null)
  , styles = Object.create(null);

/**
 * Representation of a single comment style.
 *
 * @constructor
 * @param {String} body Comment style for the body.
 * @param {String} start Comment style to start a comment.
 * @param {String} end Comment style to end a comment.
 * @api private
 */
function Style(body, start, end) {
  this.body = body;
  this.end = end || body;
  this.start = start || body;
}

//
// Generate the different comment styles.
//
styles.hash = new Style('#');
styles.slash = new Style('//');
styles.star = new Style(' *','/**', ' */');
styles.triple = new Style('', '###', '###');
styles.html = new Style(' //', '<!--', '-->');

//
// Assign the different extensions to their correct commenting styles.
//
extension['.htm'] =
extension['.svg'] =
extension['.html'] = styles.html;

extension['.js'] =
extension['.css'] =
extension['.less'] =
extension['.sass'] =
extension['.styl'] = styles.star;

extension['.coffee'] = styles.triple;

extension['.jade'] = styles.slash;

extension['.appcache'] =
extension[''] = styles.hash;

/**
 * Generate the resulting comment.
 *
 * Options:
 *
 * - style: Comment style for the given extension.
 * - extension: Extension where we determine our commenting style upon.
 *
 * @param {String|Array} text Text for the actual comment.
 * @param {Object} options Additional configuration.
 * @returns {String}
 * @api public
 */
function commenting(text, options) {
  //
  // Force comments to an array so we can easily assemble the resulting comment.
  //
  if ('string' === typeof text) text = text.split('\n');
  if (options.extension && options.extension.charAt(0) !== '.') {
    options.extension = '.'+ options.extension;
  }

  var style = options.style || extension[options.extension] || styles.star
    , comment = [];

  comment.push(style.start);

  //
  // Just map the text and prefix it with comment body so we can optimize for
  // fewer Array.push calls for larger comments.
  //
  Array.prototype.push.apply(comment, text.map(function each(line) {
    return style.body + (line ? ' ' + line.trim() : '');
  }));

  comment.push(style.end);
  comment.push('');

  return comment.join('\n');
}

//
// Expose all the interfaces.
//
commenting.Style = Style;
commenting.styles = styles;
commenting.extension = extension;

module.exports = commenting;
