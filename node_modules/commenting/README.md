# commenting

Commenting is a small module that allows you to wrap text in to a comment format
which is suitable for the supplied extension. This can be useful if you do not
want to trigger content errors for 404 routes on static assets so you can put
your reason inside a comment instead of returning HTML. But it can also be used
a development tool to inject build information in to your files for example.

## Installation

Module is released in the public npm registry and can be installed by running:

```
npm install --save commenting
```

## Usage

The module exposes a single function as API. This function accepts the text as
string or array as first argument and an options object as last argument. The
following options are supported:

- extension: The file extension, which is used to figure out which comment style
  should be used.
- style: Override default extension mapping and provide a comment style your
  self (should be an object with start, body and end properties which contains
  the comment styles).

```js
'use strict';

var commenting = require('commenting')
  , comment;

comment = commenting('hello world', { extension: '.js' });

/**
 * hello world
 */

comment = commenting(['hello', 'world'], { extension: '.jade' });

//
// hello
// world
//
```

The following extensions are supported:

- html, html: Uses HTML comments.
- js, css, less, sass: Uses `/**/` style comments
- coffee: Uses `###` style comments.
- jade: Uses `//` style comments.

Empty files or extension option with `''` as value is automatically mapped to a
hash `#` based comment style. This is because things like `.npmignore` or
`.gitignore` don't have have extensions that we can track.

## License

MIT
