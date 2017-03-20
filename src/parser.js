/*
program ::= { expression }
expression ::= function | value
function ::= '(', 'define', name-arguments-list, value, ')'
name-arguments-list ::= name | '(', { name } ')'
value ::= '(', constants | function-call | condition, ')'
function-call ::= name, [arguments]
arguments ::= { value }
condition ::= 'if', value | constants, value | constants, value | constants
constants ::= number | string
name ::= [_a-zA-Z][a-zA-Z0-9]*

tokens:
  '(', ')', 'define', 'if', string, number, name
*/

import {
  TK_PARENT_LEFT,
  TK_PARENT_RIGHT,
  TK_DEFINE,
  TK_IF,
  TK_STRING,
  TK_NUMBER,
  TK_NAME
} from './tokenizer'

export default (tokens) => {
  let index = 0
  const peekToken = () => tokens[index + 1]
  const currentToken = () => tokens[index]
  const nextToken = () => tokens[++index]

  function parseProgram () {
    const expressions = []
    while (index < tokens.length) {
      expressions.push(parseExpression())
    }
    return expressions
  }

  function parseExpression () {
    console.log('Parsing: Expression')
    const lookup = peekToken()
    if (isToken(lookup, TK_DEFINE)) {
      return parseFunction()
    } else {
      return parseValue()
    }
  }

  function parseFunction () {
    console.log('Parsing: FUNCTION')
    const node = { type: 'function' }
    eatToken(TK_PARENT_LEFT)
    eatToken(TK_DEFINE)
    node.nameAndArguments = parseNameArgumentsList()
    node.body = parseValue()
    eatToken(TK_PARENT_RIGHT)
    return node
  }

  function parseNameArgumentsList () {
    console.log('Parsing: arguments-list')
    let token = currentToken()
    const args = []
    const node = {}
    if (isToken(token, TK_NAME)) {
      node.name = token.value
      nextToken()
    } else {
      eatToken(TK_PARENT_LEFT)
      token = eatToken(TK_NAME)
      node.name = token.value
      token = currentToken()
      while (isToken(token, TK_NAME)) {
        args.push(token.value)
        token = nextToken()
      }
      node.args = args
      eatToken(TK_PARENT_RIGHT)
    }
    return node
  }

  function parseValue () {
    eatToken(TK_PARENT_LEFT)
    let node
    const token = currentToken()
    console.log('Parsing: value', token)
    if (isToken(token, TK_IF)) {
      node = parseCondition()
    } else if (isToken(token, TK_NAME)) {
      node = parseFunctionCall()
    } else if (isConstant(token)) {
      node = parseConstant()
    }
    eatToken(TK_PARENT_RIGHT)
    return node
  }

  function parseCondition () {
    console.log('Parsing: condition')
    eatToken(TK_IF)
    const node = { type: 'condition' }
    node.condition = parseValueOrConstant()
    node.trueValue = parseValueOrConstant()
    const token = currentToken()
    if (
      isToken(token, TK_PARENT_LEFT) ||
      isConstant(token)
    ) {
      node.falseValue = parseValueOrConstant()
    }
    return node
  }

  function parseValueOrConstant () {
    console.log('Parsing: value or constant')
    const token = currentToken()
    if (isToken(token, TK_PARENT_LEFT)) {
      return parseValue()
    } else {
      return parseConstant()
    }
  }

  function parseFunctionCall () {
    let token = eatToken(TK_NAME)
    console.log('Parsing: function call', token)
    const node = {
      type: 'function-call',
      name: token.value
    }
    const args = []
    token = currentToken()
    while (
      isToken(token, TK_PARENT_LEFT) ||
      isToken(token, TK_NAME) ||
      isConstant(token)
    ) {
      if (isToken(token, TK_NAME)) {
        args.push({ type: 'var', name: token.value })
        token = nextToken()
      } else if (isToken(token, TK_PARENT_LEFT)) {
        args.push(parseValue())
        token = currentToken()
      } else {
        args.push(parseConstant())
        token = currentToken()
      }
    }
    node.args = args
    return node
  }

  function parseConstant () {
    const token = currentToken()
    nextToken()
    return { type: 'constant', value: token.value }
  }

  function isConstant (token) {
    return isToken(token, TK_STRING) || isToken(token, TK_NUMBER)
  }

  function isToken (token, type) {
    return token && token.type === type
  }

  function eatToken (type) {
    const token = currentToken()
    if (token.type === type) {
      nextToken()
      return token
    } else {
      errorToken(token, type)
    }
  }

  function error (message) {
    throw new Error(message)
  }

  function errorToken (token, expectedToken) {
    error(`Token ${token.type} with value ${token.value} is not expected. Should be ${expectedToken}`)
  }

  return parseProgram()
}
