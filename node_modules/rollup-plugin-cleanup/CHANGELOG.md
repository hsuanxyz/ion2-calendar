# rollup-plugin-cleanup changes

### v2.0.1
- Adds rollup >=0.50 as peerDependencies, hope to update devDependencies soon\*.
- Preserves empty lines inside multi-line strings.
- Welcome to @mkhl to the rollup-plugin-cleanup team!

\* MagicString v0.24.x has great enhancements, but it needs testing with this plugin.

### v2.0.0
- Requires node v4.2 or later.
- Emission of source map honors the Rollup `sourceMap` or `sourcemap` (lowercased) options.
- Generated errors are displayed through the standard Rollup's `error` method.
- Fixed tests to match rollup v0.48.x parameters and async operation.
- Now the plugin operation is async and returns a Promise.
- Using facebook [jest](http://facebook.github.io/jest/) for tests.

### v1.0.1
- New filter `"ts3s"` to preserve TypeScript [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) (See NOTE)
- Closes #5 : cleanup didn't generate a sourcemap for the transformation.
- Some refactorization to speed up some operations.
- Updated devDependencies.

*NOTE:*

TypeScript source must be already compiled to JavaScript.

### v1.0.0
- Improved regex to detect empty lines.
- Fixed minor bug not processing the input when there's no empty spaces or lines to remove.
- Fixed tests to match rollup v0.40.x output.
- Changed default Acorn `ecmaVersion` from 6 to 7 to allow parsing ES2017 (See [rollup#492](https://github.com/rollup/rollup/issues/492)).
- Updated devDependencies.
- 100% test coverage.

### v0.1.4
- Default `extensions` are changed from `"*"` to `['.js', '.jsx', '.tag']` to avoid conflicts with other plugins.
- The `extensions` option is case-sensitive by consistency with rollup plugins.

### v0.1.3
- The string passed to the comment filters now includes a character preceding the content, `"/"` for one-line comments, and `"*"` for multiline comments.
- Adds note to the README about the usage of cleanup as post-processor - See issue [#1](https://github.com/aMarCruz/rollup-plugin-cleanup/issues/1)
- Now, the default for `extensions` is `"*"`. Because _rollup_ is a JavaScript bundler and _cleanup_ is a JavaScript post-processor, it should to work with any file handled by _rollup_.

### v0.1.2
- Implements support for the removal of comments through configurable filters, using the [acorn](https://github.com/ternjs/acorn) parser for secure detection.
- Fix the `lint` script of npm.

### v0.1.1
- The generated files includes CommonJS & ES6 module versions, already transpiled.
- Fixes an error when the last empty line does not ends with eol.
- Fixes errors in the build of previous versions (incomplete `dist` folder).
- Fix Travis config, now using ESLint in the test for node 4+
- Adds automatized test for Windows, with the [AppVeyor](https://ci.appveyor.com/) service.
