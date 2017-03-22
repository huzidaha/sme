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
  RETURN
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
  const log = (astNode) => console.log(`Code generation ${astNode.type}`, astNode)
  let functionSymbols = {}
  let startPoint = 0
  ast = sortAstNodes(ast)
  ast.forEach((astNode) => {
    if (astNode.type !== AST_FUNCTION && startPoint === 0) {
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
        ensureFuntionExists(astNode)
        const ip = symbols[astNode.name]
        bytecodes.push(CALL, ip, astNode.args.length)
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
    }
  }

  function ensureVariableExists (astNode) {
    if (functionSymbols[astNode.name] === undefined) {
      throw new Error(`${astNode.name} is not defined.`)
    }
  }

  function ensureFuntionExists (astNode) {
    if (symbols[astNode.name] === undefined) {
      throw new Error(`function ${astNode.name} is not defined.`)
    }
  }

  bytecodes.startPoint = startPoint
  return bytecodes
}
