
import acorn from 'acorn'

const EOL_TYPES   = { unix: '\n', mac: '\r', win: '\r\n' }
const FIRST_LINES = /^\s*[\r\n]/
const EACH_LINE   = /.*(?:\r\n?|\n)/g
const TRIM_SPACES = /[^\S\r\n]+$/

export default function removeLines(magicStr, code, file, options) {

  // matches one or more line endings and their leading spaces
  const NEXT_LINES = /\s*[\r\n]/g

  const eolTo   = EOL_TYPES[options.normalizeEols]
  const empties = options.maxEmptyLines
  const maxEolCharsAtStart = empties < 0 ? Infinity : empties ? empties * eolTo.length : 0
  // middle lines count one more
  const maxEolChars = maxEolCharsAtStart + eolTo.length

  let match, block, region
  let changes = false
  let pos = 0

  // Helpers
  // -------

  const replaceBlock = (str, start, rep) => {
    if (str !== rep) {
      magicStr.overwrite(start, start + str.length, rep)
      changes = true
    }
  }

  const limitLines = (str, max) => {
    let ss = str.replace(EACH_LINE, eolTo)
    if (ss.length > max) {
      ss = ss.slice(0, max)
    }
    return ss
  }

  const squashRegion = (start, end, atStart, atEnd) => {
    NEXT_LINES.lastIndex = 0
    region = magicStr.slice(start, end)

    // first empty lines
    if (atStart && (match = region.match(FIRST_LINES))) {
      block = match[0]
      replaceBlock(block, start, limitLines(block, maxEolCharsAtStart))
      NEXT_LINES.lastIndex = block.length
    }

    if (empties) {
      // maxEmptyLines -1 or > 0
      while ((match = NEXT_LINES.exec(region))) {
        block = match[0]
        replaceBlock(block, start + match.index, limitLines(block, maxEolChars))
      }
    } else {
      // removes all the empty lines
      while ((match = NEXT_LINES.exec(region))) {
        replaceBlock(match[0], start + match.index, eolTo)
      }
    }

    if (atEnd && (match = TRIM_SPACES.exec(region))) {
      replaceBlock(match[0], start + match.index, '')
    }
  }

  const onToken = ({ start, end, type }) => {
    if (pos !== start) {
      squashRegion(pos, start, pos === 0, type === acorn.tokTypes.eof)
    }
    pos = end
  }

  // Lines remotion
  // --------------

  acorn.parse(code, {
    ecmaVersion: options.ecmaVersion,
    sourceType: options.sourceType,
    onToken,
  })

  return changes
}
