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
  JUMP, IF_FALSE_JUMP
} from './instructions'

export default class VM {
  constructor (codes = []) {
    this.stack = []
    this.codes = codes
    this.ip = 0 // instructions address pointer
    this.sp = -1 // stack pointer
    this.fp = null // frame pointer
  }

  performBinaryOp (op) {
    let a = this.stack[this.sp--]
    let b = this.stack[this.sp--]
    this.sp++
    this.stack[this.sp] = op(a, b)
  }

  run () {
    while (this.ip < this.codes.length) {
      let { codes, stack } = this
      const code = codes[this.ip++]
      switch (code) {
        case CONST:
          stack[++this.sp] = codes[this.ip++]
          break
        case ADD:
          this.performBinaryOp((a, b) => a + b)
          break
        case SUBSTRACT:
          this.performBinaryOp((a, b) => a - b)
          break
        case MULTIPLE:
          this.performBinaryOp((a, b) => a * b)
          break
        case DIVIDE:
          this.performBinaryOp((a, b) => a / b)
          break
        case EQUAL_TO:
          this.performBinaryOp((a, b) => a === b)
          break
        case GREATER_THAN:
          this.performBinaryOp((a, b) => a > b)
          break
        case LESS_THAN:
          this.performBinaryOp((a, b) => a < b)
          break
        case GREATER_AND_EQUAL_THAN:
          this.performBinaryOp((a, b) => a >= b)
          break
        case LESS_AND_EQUAL_THAN:
          this.performBinaryOp((a, b) => a <= b)
          break
        case PRINT:
          console.log(this.stack[this.sp--])
          break
        case JUMP:
          this.ip = this.codes[this.ip++]
          break
        case IF_FALSE_JUMP:
          if (!this.stack[this.sp--]) {
            this.ip = this.codes[this.ip++]
          }
          break
        default:
          break
      }
    }
  }
}
