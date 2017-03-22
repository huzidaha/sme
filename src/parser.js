/*
program ::= { expression }
expression ::= function | value
function ::= '(', 'define', name-list, value, ')'
name-list ::= name | '(', { name } ')'
value ::= '(', constant | function-call | condition, ')'
function-call ::= name, [argument]
condition ::= 'if', argument, argument, argument
argument ::= { value | constant | name }
constant ::= number | string
name ::= anthing is not number or string

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
    const lookup = tokens[index + 1]
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
    node.nameAndArguments = parseNameList()
    node.body = parseValue()
    eatToken(TK_PARENT_RIGHT)
    return node
  }

  function parseNameList () {
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
    node.condition = parseArgument()
    ensureExist(node.condition, 'condition must provide!')
    node.trueValue = parseArgument()
    ensureExist(node.trueValue, 'true value must provide!')
    node.falseValue = parseArgument()
    ensureExist(node.falseValue, 'false must provide!')
    return node
  }

  function parseArgument () {
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
    while (isArgument(token)) {
      args.push(parseArgument())
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

  function isArgument (token) {
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
