import test from 'ava'
import tokenizer from '../src/tokenizer'
import parser from '../src/parser'

const code = `
(define (fib n)
  (if (<= n 2)
    1
    (+ (fib (- n 1)) (fib (- n 2)))))
(display (fib 7))
`

test('parse to ast', (t) => {
  console.log(
    JSON.stringify(parser(tokenizer(code)))
  )
})
