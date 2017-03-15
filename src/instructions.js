class Instuction {
  constructor (operantsNum) {
    this.operantsNum = operantsNum
  }
}

export const ADD = new Instuction(0)
export const SUBSTRACT = new Instuction(0)
export const MULTIPLE = new Instuction(0)
export const DIVIDE = new Instuction(0)
export const CONST = new Instuction(1)
export const PRINT = new Instuction(0)
export const EQUAL_TO = new Instuction(0)
export const GREATER_THAN = new Instuction(0)
export const LESS_THAN = new Instuction(0)
export const GREATER_AND_EQUAL_THAN = new Instuction(0)
export const LESS_AND_EQUAL_THAN = new Instuction(0)
export const IF_FALSE_JUMP = new Instuction(1)
export const JUMP = new Instuction(1)
