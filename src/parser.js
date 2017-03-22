/*
program ::= { expression }
expression ::= function | value
function ::= '(', 'define', name-arguments-list, value, ')'
name-arguments-list ::= name | '(', { name } ')'
value ::= '(', constants | function-call | condition, ')'
function-call ::= name, [arguments]
arguments ::= { value | constants | name }
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

export const AST_FUNCTION = 'function definition'
export const AST_CONDITION = 'condition'
export const AST_FUNCTION_CALL = 'function call'
export const AST_VARIABLE = 'variable'
export const AST_CONSTANT = 'constant'

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
    const lookup = peekToken()
    if (isToken(lookup, TK_DEFINE)) {
      return parseFunction()
    } else {
      return parseValue()
    }
  }

  function parseFunction () {
    const node = { type: AST_FUNCTION }
    eatToken(TK_PARENT_LEFT)
    eatToken(TK_DEFINE)
    node.nameAndArguments = parseNameArgumentsList()
    node.body = parseValue()
    eatToken(TK_PARENT_RIGHT)
    return node
  }

  function parseNameArgumentsList () {
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
    eatToken(TK_IF)
    const node = { type: AST_CONDITION }
    node.condition = parseValueOrConstantOrName()
    ensureExist(node.condition, 'condition must provide!')
    node.trueValue = parseValueOrConstantOrName()
    ensureExist(node.trueValue, 'true value must provide!')
    node.falseValue = parseValueOrConstantOrName()
    ensureExist(node.falseValue, 'false must provide!')
    return node
  }

  function parseValueOrConstantOrName () {
    const token = currentToken()
    if (isToken(token, TK_NAME)) {
      nextToken()
      return { type: AST_VARIABLE, name: token.value }
    } else if (isToken(token, TK_PARENT_LEFT)) {
      return parseValue()
    } else if ((isConstant(token))) {
      return parseConstant()
    }
  }

  function parseFunctionCall () {
    let token = eatToken(TK_NAME)
    const node = {
      type: AST_FUNCTION_CALL,
      name: token.value
    }
    const args = []
    token = currentToken()
    while (isValueOrConstantOrName(token)) {
      args.push(parseValueOrConstantOrName())
      token = currentToken()
    }
    node.args = args
    return node
  }

  function parseConstant () {
    const token = currentToken()
    nextToken()
    return { type: AST_CONSTANT, value: token.value }
  }

  function isValueOrConstantOrName (token) {
    return isToken(token, TK_PARENT_LEFT) ||
      isToken(token, TK_NAME) ||
      isConstant(token)
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

  function ensureExist (value, message) {
    if (value === null || value === undefined) {
      error(message)
    }
  }

  function error (message) {
    throw new Error(`Parser Error: ${message}`)
  }

  function errorToken (token, expectedToken) {
    error(`Token ${token.type} with value ${token.value} is not expected. Should be ${expectedToken}`)
  }

  return parseProgram()
}
