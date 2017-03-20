import {
  ADD,
  SUBSTRACT,
  MULTIPLE,
  DIVIDE,
  CONST,
  PRINT,
  EQUAL_TO,
  GREATER_THAN,
  LESS_THAN,
  GREATER_AND_EQUAL_THAN,
  LESS_AND_EQUAL_THAN,
  IF_FALSE_JUMP,
  JUMP,
  LOAD,
  CALL,
  RETURN,
  AND,
  OR
} from './instructions'

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
        case CONST:
          stack[++this.sp] = codes[this.ip++]
          break
        case ADD:
          this.binaryOperation((a, b) => a + b)
          break
        case SUBSTRACT:
          this.binaryOperation((a, b) => a - b)
          break
        case MULTIPLE:
          this.binaryOperation((a, b) => a * b)
          break
        case DIVIDE:
          this.binaryOperation((a, b) => a / b)
          break
        case EQUAL_TO:
          this.binaryOperation((a, b) => a === b)
          break
        case GREATER_THAN:
          this.binaryOperation((a, b) => a > b)
          break
        case LESS_THAN:
          this.binaryOperation((a, b) => a < b)
          break
        case GREATER_AND_EQUAL_THAN:
          this.binaryOperation((a, b) => a >= b)
          break
        case LESS_AND_EQUAL_THAN:
          this.binaryOperation((a, b) => a <= b)
          break
        case AND:
          this.binaryOperation((a, b) => a && b)
          break
        case OR:
          this.binaryOperation((a, b) => a || b)
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
        default:
          break
      }
      if (this.trace) this.logStack()
    }
  }
}
