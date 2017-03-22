import {
  AST_FUNCTION,
  AST_CONDITION,
  AST_FUNCTION_CALL,
  AST_VARIABLE,
  AST_CONSTANT
} from './parser'

import {
  ADD,
  SUBSTRACT,
  MULTIPLE,
  DIVIDE,
  PUSH,
  PRINT,
  EQUAL_TO,
  GREATER_THAN,
  GREATER_AND_EQUAL_THAN,
  LESS_THAN,
  LESS_AND_EQUAL_THAN,
  AND,
  OR,
  IF_FALSE_JUMP,
  JUMP,
  LOAD,
  CALL,
  RETURN,
  HALT
} from './vm'

const builtins = {
  '+': ADD,
  '-': SUBSTRACT,
  '*': MULTIPLE,
  '/': DIVIDE,
  '<': LESS_THAN,
  '>': GREATER_THAN,
  '<=': LESS_AND_EQUAL_THAN,
  '>=': GREATER_AND_EQUAL_THAN,
  'display': PRINT,
  '&&': AND,
  '||': OR,
  '==': EQUAL_TO
}

export default (ast) => {
  const bytecodes = []
  const symbols = {}
  const functionCallsQueue = []
  const log = (astNode) => { /* console.log(`Code generation ${astNode.type}`, astNode) */ }
  let functionSymbols = {}
  let startPoint = null
  ast = sortAstNodes(ast)
  ast.forEach((astNode) => {
    if (
      astNode.type !== AST_FUNCTION &&
      startPoint === null
    ) {
      startPoint = bytecodes.length
    }
    generateBytecodes(astNode)
  })

  function sortAstNodes (astNodes) {
    const newAst = []
    astNodes.forEach((astNode) => {
      if (astNode.type === AST_FUNCTION) {
        newAst.unshift(astNode)
      } else {
        newAst.push(astNode)
      }
    })
    return newAst
  }

  function generateBytecodes (astNode) {
    if (!astNode) return
    log(astNode)
    if (astNode.type === AST_FUNCTION_CALL) {
      astNode.args.forEach(generateBytecodes)
      const builtinFunc = builtins[astNode.name]
      if (builtinFunc !== undefined) {
        bytecodes.push(builtinFunc)
      } else {
        bytecodes.push(CALL, null, astNode.args.length)
        functionCallsQueue.push({
          name: astNode.name,
          position: bytecodes.length - 2
        })
      }
    } else if (astNode.type === AST_CONSTANT) {
      bytecodes.push(PUSH, astNode.value)
    } else if (astNode.type === AST_CONDITION) {
      // generate condition for if
      generateBytecodes(astNode.condition)
      // make if condition run
      bytecodes.push(IF_FALSE_JUMP, null)
      const toSetFalseJumpPosition = bytecodes.length - 1
      generateBytecodes(astNode.trueValue)
      // should jump to condition end when if is end
      bytecodes.push(JUMP, null)
      const jumpInstructionPosition = bytecodes.length
      bytecodes[toSetFalseJumpPosition] = jumpInstructionPosition
      const toSetTrueEndPosition = bytecodes.length - 1
      // generate else run
      generateBytecodes(astNode.falseValue)
      bytecodes[toSetTrueEndPosition] = bytecodes.length
    } else if (astNode.type === AST_FUNCTION) {
      const { name, args } = astNode.nameAndArguments
      symbols[name] = bytecodes.length
      functionSymbols = {}
      let argsIndexStart = -2 - args.length
      args.forEach((arg, i) => {
        functionSymbols[arg] = argsIndexStart + i
      })
      generateBytecodes(astNode.body)
      bytecodes.push(RETURN)
    } else if (astNode.type === AST_VARIABLE) {
      ensureVariableExists(astNode)
      const ip = functionSymbols[astNode.name]
      bytecodes.push(LOAD, ip)
    } else {
      throw new Error(`Unknown AST node type '${astNode.type}'`)
    }
  }

  function ensureVariableExists (astNode) {
    if (functionSymbols[astNode.name] === undefined) {
      throw new Error(`'${astNode.name}' is not defined.`)
    }
  }

  function ensureFuntionExists (name) {
    if (symbols[name] === undefined) {
      throw new Error(`function '${name}' is not defined.`)
    }
  }

  function injectFunctionCalls () {
    functionCallsQueue.forEach((functionCall) => {
      ensureFuntionExists(functionCall.name)
      const functionIp = symbols[functionCall.name]
      bytecodes[functionCall.position] = functionIp
    })
  }

  injectFunctionCalls()
  bytecodes.push(HALT, startPoint || 0)
  return bytecodes
}
