import test from 'ava'
import tokenizer from '../src/tokenizer'
import parser from '../src/parser'

const code = `
(define (fib n)
  (if (<= n 2)
    1
    (+ (fib (- n 1)) (fib (- n 2)))))
(define (plus x y) (+ x y))
(display (fib 7))
(display (plus 3 9))
`

test.skip('parse to ast', (t) => {
  console.log(parser(tokenizer(code)))
})
