
import acorn from 'acorn'

/**
 * By using a premaked block of spaces, blankBlock is faster than
 * simple block.replace(/[^ \n]+/, ' ').
 *
 * @const {string}
 * @private
 */
const _spaces = new Array(150).join(' ')

/**
 * Matches non-EOL characteres.
 * @const
 * @private
 */
const NOBLANK = /[^\n\r]+/g

/**
 * Replaces all the non-EOL characters in the block with spaces.
 *
 * @param   {string} block - The buffer to replace
 * @returns {string}         The replaced block.
 * @private
 */
function blankBlock(block) {
  const len = block.length

  let spaces = _spaces
  while (spaces.length < len) {
    spaces += _spaces
  }

  return spaces.slice(0, len)
}

/**
 * Replaces the comments with spaces.
 *
 * @param {string} code - JS code
 * @param {string} file - Name of the file being processed
 * @param {object} options - User options
 * @prop {boolean|RegExp[]} options.comments - Comment filters
 * @returns {string} The processed code
 */
export default function blankComments(code, file, options) {
  const comments = options.comments

  const onComment = function (block, text, start, end) {
    if (comments !== false) {
      text = (block ? '*' : '/') + text
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].test(text)) return
      }
    }
    text = code.slice(start, end).replace(NOBLANK, blankBlock)
    code = code.slice(0, start) + text + code.slice(end)
  }

  // Now replace the comments. As blankComment will not change code
  // positions, trimming empty lines will be easy.
  acorn.parse(code, {
    ecmaVersion: options.ecmaVersion,
    sourceType: options.sourceType,
    onComment
  })

  return code
}
