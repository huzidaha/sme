import test from 'ava'
import tokenizer from '../src/tokenizer'

const code = `
(define (fib n)
  (if (<= n 2)
    1
    (+ (fib (- n 1)) (fib (- n 2)))))
(display (fib 7))
(display 'fuckyou' 'everyday')
`

test.skip('parse to ast', (t) => {
  // console.log(tokenizer(code))
})
