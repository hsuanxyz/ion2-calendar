describe('commenting', function () {
  'use strict';

  var commenting = require('./')
    , assume = require('assume');

  it('is exported as a function', function () {
    assume(commenting).is.a('function');
  });

  it('can use array for multi-line comments', function () {
    var comment = commenting(['hello', 'world'], {
      extension: '.js'
    });

    assume(comment).includes('/**\n');
    assume(comment).includes(' * hello\n');
    assume(comment).includes(' * world\n');
    assume(comment).includes(' */');
  });

  it('trims comments', function () {
    var comment = commenting('hello  ', {
      extension: '.js'
    });

    assume(comment).includes('/**\n');
    assume(comment).includes(' * hello\n');
    assume(comment).includes(' */\n');
  });

  it('keep empty lines', function () {
    var comment = commenting(['hello', '', 'world'], {
      extension: '.js'
    });

    assume(comment).includes('/**\n');
    assume(comment).includes(' * hello\n');
    assume(comment).includes(' *\n');
    assume(comment).includes(' * world\n');
    assume(comment).includes(' */\n');
  });

  it('uses the supplied style', function () {
    var comment = commenting('hello  ', {
      style: commenting.styles.slash
    });

    assume(comment).includes('//\n');
    assume(comment).includes('// hello\n');
  });

  it('accepts extensions without a dot prefix', function () {
    var comment = commenting('hello', {
      extension: 'html'
    });

    assume(comment).includes('<!--\n');
    assume(comment).includes(' // hello\n');
    assume(comment).includes('-->\n');
  });

  it('defaults to /* if extension can not be determined', function () {
    var comment = commenting(['hello', 'world'], {
      extension: '.js'+ Math.random()
    });

    assume(comment).includes('/**\n');
    assume(comment).includes(' * hello\n');
    assume(comment).includes(' * world\n');
    assume(comment).includes(' */');
  });

  it('maps an empty string extension to hash', function () {
    var comment = commenting(['hello', 'world'], {
      extension: ''
    });

    assume(comment).includes('# hello\n');
    assume(comment).includes('# world\n');
  });

  it('maps appcache extension to hash', function () {
    var comment = commenting(['hello', 'world'], {
      extension: '.appcache'
    });

    assume(comment).includes('# hello\n');
    assume(comment).includes('# world\n');
  });
});
