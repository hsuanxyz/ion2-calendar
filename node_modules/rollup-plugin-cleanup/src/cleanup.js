/* eslint no-debugger:0 */

import MagicString from 'magic-string'
import blankComments from './blank-comments'
import removeLines from './remove-lines'

export default function cleanup(source, file, options) {

  return new Promise(resolve => {
    let changes
    let code

    if (options.comments === true) {
      code = source
    } else {
      code = blankComments(source, file, options)
      changes = code !== source
    }

    const magicStr = new MagicString(code)

    changes = removeLines(magicStr, code, file, options) || changes

    resolve(changes
      ? {
        code: magicStr.toString(),
        map: options.sourceMap ? magicStr.generateMap({ hires: true }) : null
      }
      : null)   // tell to Rollup that discard this result

  })

}
