import createFilter from './create-filter'
import parseOptions from './parse-options'
import cleanup from './cleanup'

/**
 * Returns the rollup-plugin-cleanup instance.
 * @param   {Object} options - Plugin's user options
 * @returns {Object} Plugin instance.
 */
export default function rollupCleanup(options) {
  if (!options) options = {}

  // merge include, exclude, and extensions
  const filter = createFilter(options)

  // validate and clone the plugin options
  options = parseOptions(options)

  // the plugin instance
  return {

    name: 'cleanup',

    options(opts) {
      if (opts.sourceMap === false || opts.sourcemap === false) {
        options.sourceMap = false
      }
    },

    transform(code, id) {

      if (filter(id)) {

        return cleanup(code, id, options)
          .catch(err => {
            if (typeof this.error == 'function') {
              this.error(err)
            } else {
              throw new Error(err)
            }
          })

      }

      return null
    }
  }
}
