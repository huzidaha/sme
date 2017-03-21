import test from 'ava'
import tokenizer from '../src/tokenizer'
import parser from '../src/parser'
import codegen from '../src/codegen'
import VM, { makeReadableBytecodes } from '../src/vm'

// const code = `
// (define (fib n)
//   (if (<= n 2)
//     1
//     (+ (fib (- n 1)) (fib (- n 2)))))
// (define (plus x y) (+ x y))
// (display (fib 7))
// (display (plus 3 9))
// `
const stack = (vm) => vm.stack.slice(0, vm.sp + 1)

test('Simple math', (t) => {
  const ast = parser(tokenizer(`
    (+ 1 2)
    (/ (+ 1 5) (+ 1 1))
  `))
  const codes = codegen(ast)
  const vm = new VM(codes)
  vm.run()
  t.deepEqual(vm.stack.slice(0, vm.sp + 1), [3, 3])
})

test('Condition', (t) => {
  const codes = codegen(parser(tokenizer(`
    (if (>= 1 2)
      (+ 2 2)
      (/ (+ 1 5) (+ 1 1)))
  `)))
  const vm = new VM(codes)
  vm.trace = true
  vm.run()
  t.deepEqual(stack(vm), [3])
})

test('Condition', (t) => {
  const ast = parser(tokenizer(`
    (if (>= 1 2)
      (+ 2 2)
      (/ (+ 1 5) (+ 1 1)))
    (if (> 1 2)
      1
      (if (>= 10 32) 3 (/ 4 2)))
    (if (< 2 10) (+ 1 11))
  `))
  const codes = codegen(ast)
  const vm = new VM(codes)
  vm.run()
  t.deepEqual(stack(vm), [3, 2, 12])
})

test('Function definition', (t) => {
  const codes = codegen(parser(tokenizer(`
    (define (sayHi x y)
      (if (> x y) (+ x y) (- x y)))
    (define (fib n)
      (if (<= n 2)
        1
        (+ (fib (- n 1)) (fib (- n 2)))))
    (sayHi 10 2)
    (sayHi 2 10)
    (fib 7)
  `)))
  console.log(makeReadableBytecodes(codes))
  const vm = new VM(codes)
  vm.run(codes.startPoint)
  t.deepEqual(stack(vm), [12, -8, 13])
})
