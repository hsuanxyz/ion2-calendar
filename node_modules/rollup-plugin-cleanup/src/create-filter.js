
import { createFilter } from 'rollup-pluginutils'
import { extname } from 'path'

/**
 * Creates a filter for the options `include`, `exclude`, and `extensions`.
 * Since `extensions` is not a rollup option, I think is widely used.
 *
 * @param {object} opts? - The user options
 * @returns {function}     Filter function that returns true if a given
 *                         file matches the filter.
 */
export default function _createFilter(opts) {

  const filt = createFilter(opts.include, opts.exclude)

  let exts = opts.extensions || ['.js', '.jsx', '.tag']
  if (!Array.isArray(exts)) exts = [exts]
  for (let i = 0; i < exts.length; i++) {
    const e = exts[i]
    if (e === '*') {
      exts = '*'
      break
    } else if (e[0] !== '.') {
      exts[i] = '.' + e
    }
  }

  return function (name) {
    return filt(name) && (exts === '*' || exts.indexOf(extname(name)) > -1)
  }
}
