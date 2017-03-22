import test from 'ava'
import tokenizer from '../src/tokenizer'
import parser from '../src/parser'
import codegen from '../src/codegen'
import VM, { makeReadableBytecodes } from '../src/vm'

const stack = (vm) => vm.stack.slice(0, vm.sp + 1)

test('simple math', (t) => {
  const ast = parser(tokenizer(`
    (+ 1 2)
    (/ (+ 1 5) (+ 1 1))
  `))
  const codes = codegen(ast)
  const vm = new VM(codes)
  vm.run(codes[codes.length - 1])
  t.deepEqual(vm.stack.slice(0, vm.sp + 1), [3, 3])
})

test('simple condition', (t) => {
  const codes = codegen(parser(tokenizer(`
    (if (>= 1 2)
      (+ 2 2)
      (/ (+ 1 5) (+ 1 1)))
  `)))
  const vm = new VM(codes)
  vm.run(codes[codes.length - 1])
  t.deepEqual(stack(vm), [3])
})

test('complex condition', (t) => {
  const ast = parser(tokenizer(`
    (if (>= 1 2)
      (+ 2 2)
      (/ (+ 1 5) (+ 1 1)))
    (if (> 1 2)
      1
      (if (>= 10 32) 3 (/ 4 2)))
    (if (< 2 10) (+ 1 11) 1)
  `))
  const codes = codegen(ast)
  const vm = new VM(codes)
  vm.run(codes[codes.length - 1])
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
  const vm = new VM(codes)
  vm.run(codes[codes.length - 1])
  t.deepEqual(stack(vm), [12, -8, 13])
})

test('sqrt', (t) => {
  const codes = codegen(parser(tokenizer(`
    (define (square x) (* x x))
    (define (abs x) (if (> x 0) x (- 0 x)))
    (define (sqrt-iter guess x)
      (if (good-enough? guess x)
          guess
          (sqrt-iter (improve guess x) x)))
    (define (improve guess x)
      (average guess (/ x guess)))
    (define (average x y)
      (/ (+ x y) 2))
    (define (good-enough? guess x)
      (< (abs (- (square guess) x)) 0.001))
    (define (sqrt x)
      (sqrt-iter 1.0 x))
    (sqrt 9)
  `)))
  const vm = new VM(codes)
  vm.run(codes[codes.length - 1])
  t.deepEqual(stack(vm), [3.00009155413138])
})

test('fib and sqrt', (t) => {
  const codes = codegen(parser(tokenizer(`
    (define (fib n)
      (if (<= n 2)
        1
        (+ (fib (- n 1)) (fib (- n 2)))))
    (define (abs x) (if (> x 0) x (- 0 x)))
    (define (square x) (* x x))
    (define (sqrt-iter guess x)
      (if (good-enough? guess x)
          guess
          (sqrt-iter (improve guess x) x)))
    (define (improve guess x)
      (average guess (/ x guess)))
    (define (average x y)
      (/ (+ x y) 2))
    (define (good-enough? guess x)
      (< (abs (- (square guess) x)) 0.001))
    (define (sqrt x)
      (sqrt-iter 1.0 x))
    (sqrt (fib 9))
  `)))
  console.log(makeReadableBytecodes(codes))
  const vm = new VM(codes)
  vm.run(codes[codes.length - 1])
  t.deepEqual(stack(vm), [5.830951897587282])
})
