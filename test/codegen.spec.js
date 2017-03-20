import test from 'ava'
import tokenizer from '../src/tokenizer'
import parser from '../src/parser'
import codegen from '../src/codegen'
import VM from '../src/vm'

// const code = `
// (define (fib n)
//   (if (<= n 2)
//     1
//     (+ (fib (- n 1)) (fib (- n 2)))))
// (define (plus x y) (+ x y))
// (display (fib 7))
// (display (plus 3 9))
// `

test('parse to ast', (t) => {
  const ast = parser(tokenizer(`
    (+ 1 2)
    (/ (+ 1 5) (+ 1 1))
  `))
  const codes = codegen(ast)
  const vm = new VM(codes)
  vm.run()
  t.deepEqual(vm.stack.slice(0, vm.sp + 1), [3, 3])
})
