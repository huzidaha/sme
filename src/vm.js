export const ADD = 0
export const SUBSTRACT = 1
export const MULTIPLE = 2
export const DIVIDE = 3
export const PUSH = 4
export const PRINT = 5
export const EQUAL_TO = 6
export const GREATER_THAN = 7
export const GREATER_AND_EQUAL_THAN = 8
export const LESS_THAN = 9
export const LESS_AND_EQUAL_THAN = 10
export const AND = 11
export const OR = 12
export const IF_FALSE_JUMP = 13
export const JUMP = 14
export const LOAD = 15
export const CALL = 16
export const RETURN = 17
export const HALT = 18

export default class VM {
  constructor (codes = []) {
    this.stack = []
    this.codes = codes
    this.ip = 0 // instructions address pointer
    this.sp = -1 // stack pointer
    this.fp = null // frame pointer
    this.trace = false
  }

  binaryOperation (op) {
    let a = this.stack[this.sp--]
    let b = this.stack[this.sp--]
    this.sp++
    this.stack[this.sp] = op(a, b)
  }

  logStack () {
    console.log(this.stack.slice(0, this.sp + 1))
  }

  run (fromIp = 0) {
    this.ip = fromIp
    while (this.ip < this.codes.length) {
      let { codes, stack } = this
      let a, b
      const code = codes[this.ip++]
      switch (code) {
        case PUSH:
          stack[++this.sp] = codes[this.ip++]
          break
        case ADD:
          this.binaryOperation((a, b) => b + a)
          break
        case SUBSTRACT:
          this.binaryOperation((a, b) => b - a)
          break
        case MULTIPLE:
          this.binaryOperation((a, b) => b * a)
          break
        case DIVIDE:
          this.binaryOperation((a, b) => b / a)
          break
        case EQUAL_TO:
          this.binaryOperation((a, b) => b === a)
          break
        case GREATER_THAN:
          this.binaryOperation((a, b) => b > a)
          break
        case LESS_THAN:
          this.binaryOperation((a, b) => b < a)
          break
        case GREATER_AND_EQUAL_THAN:
          this.binaryOperation((a, b) => b >= a)
          break
        case LESS_AND_EQUAL_THAN:
          this.binaryOperation((a, b) => b <= a)
          break
        case AND:
          this.binaryOperation((a, b) => b && a)
          break
        case OR:
          this.binaryOperation((a, b) => b || a)
          break
        case PRINT:
          console.log(stack[this.sp--])
          break
        case JUMP:
          this.ip = codes[this.ip]
          break
        case IF_FALSE_JUMP:
          if (!stack[this.sp--]) {
            this.ip = codes[this.ip]
          } else {
            this.ip++
          }
          break
        case LOAD:
          a = codes[this.ip++]
          stack[++this.sp] = stack[this.fp + a]
          break
        case CALL:
          // -> fp
          //    ip
          //    numArgs
          //    ...
          //    arg3
          //    arg2
          //    arg1
          a = codes[this.ip++]
          b = codes[this.ip++]
          stack[++this.sp] = b // number of arguments
          stack[++this.sp] = this.ip // run after return
          stack[++this.sp] = this.fp
          this.fp = this.sp
          this.ip = a // start to call
          break
        case RETURN:
          a = stack[this.sp]
          this.sp = this.fp // restore sp pointer
          this.fp = stack[this.sp] // restore fp pointer
          this.sp-- // -> ip
          this.ip = stack[this.sp] // restore ip
          this.sp-- // -> number of arguments
          this.sp = this.sp - stack[this.sp] // jump to last
          stack[this.sp] = a // set it to returned value
          break
        case HALT:
          return
        default:
          break
      }
      if (this.trace) this.logStack()
    }
  }
}

const inst = (name, numOfOperants) => ({ name, numOfOperants })
const codeMaps = {
  [ADD]: inst('ADD', 0),
  [SUBSTRACT]: inst('SUBSTRACT', 0),
  [MULTIPLE]: inst('MULTIPLE', 0),
  [DIVIDE]: inst('DIVIDE', 0),
  [PUSH]: inst('PUSH', 1),
  [PRINT]: inst('PRINT', 0),
  [EQUAL_TO]: inst('EQUAL_TO', 0),
  [GREATER_THAN]: inst('GREATER_THAN', 0),
  [GREATER_AND_EQUAL_THAN]: inst('GREATER_AND_EQUAL_THAN', 0),
  [LESS_THAN]: inst('LESS_THAN', 0),
  [LESS_AND_EQUAL_THAN]: inst('LESS_AND_EQUAL_THAN', 0),
  [AND]: inst('AND', 0),
  [OR]: inst('OR', 0),
  [IF_FALSE_JUMP]: inst('IF_FALSE_JUMP', 1),
  [JUMP]: inst('JUMP', 1),
  [LOAD]: inst('LOAD', 1),
  [CALL]: inst('CALL', 2),
  [RETURN]: inst('RETURN', 0),
  [HALT]: inst('HALT', 1)
}

export const makeReadableBytecodes = (codes) => {
  const bytecodes = []
  for (let i = 0, len = codes.length; i < len; i++) {
    const code = codes[i]
    const instruction = codeMaps[code]
    bytecodes.push(i, ' ', instruction.name)
    for (let j = 0, len2 = instruction.numOfOperants; j < len2; j++) {
      const operant = codes[++i]
      bytecodes.push(' ', operant)
    }
    bytecodes.push('\n')
  }
  return bytecodes.join('')
}
