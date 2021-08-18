/* eslint no-useless-escape:0 */

const _filters = {
  // only preserve license
  license:  /@license\b/,
  // (almost) like the uglify defaults
  some:     /(?:@license|@preserve|@cc_on)\b/,
  // http://usejsdoc.org/
  jsdoc:    /^\*\*[^@]*@[A-Za-z]/,
  // http://www.jslint.com/help.html
  jslint:   /^[/\*](?:jslint|global|property)\b/,
  // http://jshint.com/docs/#inline-configuration
  jshint:   /^[/\*]\s*(?:jshint|globals|exported)\s/,
  // http://eslint.org/docs/user-guide/configuring
  eslint:   /^[/\*]\s*(?:eslint(?:\s|-env|-disable|-enable)|global\s)/,
  // https://palantir.github.io/tslint/usage/rule-flags/
  ts3s:     /^\/\/[ \t]*<(?:reference\s|amd-).*>/,
  // http://jscs.info/overview
  jscs:     /^[/\*]\s*jscs:[ed]/,
  // https://gotwarlost.github.io/istanbul/
  istanbul: /^[/\*]\s*istanbul\s/,
  // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
  srcmaps:  /^.[#@]\ssource(?:Mapping)?URL=/
}

export default function parseOptions(options) {

  // multiple forms to specify comment filters, default is 'some'
  let comments = options.comments
  if (comments == null) {
    comments = [_filters.some]
  } else if (typeof comments != 'boolean') {
    const filters = Array.isArray(comments) ? comments : [comments]
    comments = []
    for (let i = 0; i < filters.length; i++) {
      const f = filters[i]
      if (f instanceof RegExp) {
        comments.push(f)
      } else if (f === 'all') {
        comments = true
        break
      } else if (f === 'none') {
        comments = false
        break
      } else if (f in _filters) {
        comments.push(_filters[f])
      } else {
        throw new Error(`cleanup: unknown comment filter: "${f}"`)
      }
    }
  }

  let normalizeEols = options.hasOwnProperty('normalizeEols')
    ? options.normalizeEols : options.eolType
  if (normalizeEols !== false && normalizeEols !== 'win' && normalizeEols !== 'mac') {
    normalizeEols = 'unix'
  }

  return {
    ecmaVersion: options.ecmaVersion || 8,
    sourceMap: options.sourceMap !== false && options.sourcemap !== false,
    sourceType: options.sourceType || 'module',
    maxEmptyLines: options.maxEmptyLines | 0,
    normalizeEols,
    comments
  }
}
