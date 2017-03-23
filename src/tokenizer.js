export const TK_PARENT_LEFT = 'TK_PARENT_LEFT'
export const TK_PARENT_RIGHT = 'TK_PARENT_RIGHT'
export const TK_DEFINE = 'TK_DEFINE'
export const TK_IF = 'TK_IF'
export const TK_STRING = 'TK_STRING'
export const TK_NUMBER = 'TK_NUMBER'
export const TK_NAME = 'TK_NAME'

export default (code) => {
  const tokens = []
  let i = 0
  let token = ''
  let isInString = false
  let str = ''
  while (i < code.length) {
    const char = code[i++]
    if (char !== '\'' && isInString) {
      str += char
    } else if (char.trim() === '') {
      processToken()
    } else if (char === '(') {
      processToken()
      tokens.push({ type: TK_PARENT_LEFT, value: '(' })
    } else if (char === ')') {
      processToken()
      tokens.push({ type: TK_PARENT_RIGHT, value: ')' })
    } else if (char === '\'') {
      if (isInString) {
        tokens.push({ type: TK_STRING, value: str })
        str = ''
      }
      isInString = !isInString
    } else {
      token += char
    }
  }

  function processToken () {
    if (token === '') return
    if (token === 'define') {
      tokens.push({ type: TK_DEFINE, token })
    } else if (token === 'if') {
      tokens.push({ type: TK_IF, token })
    } else if (!isNaN(token)) {
      tokens.push({ type: TK_NUMBER, value: +token })
    } else {
      tokens.push({ type: TK_NAME, value: token })
    }
    token = ''
  }
  return tokens
}
