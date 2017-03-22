import test from 'ava'
import VM, {
  ADD,
  SUBSTRACT,
  MULTIPLE,
  DIVIDE,
  PUSH,
  PRINT,
  EQUAL_TO,
  GREATER_THAN,
  LESS_THAN,
  IF_FALSE_JUMP,
  JUMP,
  LOAD,
  CALL,
  RETURN,
  makeReadableBytecodes
} from '../src/vm'

const spv = (vm, n = 0) => vm.stack[vm.sp - n]

test('PUSH instruction', (t) => {
  const vm = new VM([
    PUSH, 1,
    PUSH, 2,
    PUSH, 3
  ])
  vm.run()
  t.deepEqual(vm.stack, [1, 2, 3])
})

test('Math instructions', (t) => {
  const vm = new VM([
    PUSH, 1,
    PUSH, 2,
    ADD,
    PUSH, 21,
    ADD,
    PUSH, 48,
    DIVIDE,
    PUSH, 3,
    MULTIPLE,
    PUSH, 5.5,
    SUBSTRACT
  ])
  vm.run()
  t.is(vm.stack[0], -4)
  t.is(vm.sp, 0)
})

test('PRINT', (t) => {
  const vm = new VM([
    PUSH, 20, PRINT
  ])
  vm.run()
  t.is(vm.sp, -1)
})

test('EQUAL_TO', (t) => {
  let vm = new VM([
    PUSH, 20,
    PUSH, 20,
    EQUAL_TO
  ])
  vm.run()
  t.is(vm.stack[vm.sp], true)
  vm = new VM([
    PUSH, 21,
    PUSH, 20,
    EQUAL_TO
  ])
  vm.run()
  t.is(vm.stack[vm.sp], false)
})

test('LESS_THAN', (t) => {
  let vm = new VM([
    PUSH, 20,
    PUSH, 21,
    LESS_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], true)
  vm = new VM([
    PUSH, 21,
    PUSH, 20,
    LESS_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], false)
})

test('GREATER_THAN', (t) => {
  let vm = new VM([
    PUSH, 20,
    PUSH, 21,
    GREATER_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], false)
  vm = new VM([
    PUSH, 21,
    PUSH, 20,
    GREATER_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], true)
})

test('IF_FALSE_JUMP: TRUE', (t) => {
  let vm = new VM([
    PUSH, 20, // 0
    PUSH, 21, // 2
    GREATER_THAN, // 4
    IF_FALSE_JUMP, 14, // 5
    PUSH, 3, // 7
    PUSH, 5, // 9
    ADD, // 11
    JUMP, 19, // 12
    PUSH, 2, // 14
    PUSH, 12, // 16
    SUBSTRACT, // 18
    PUSH, 1, // 19
    ADD // 20
  ])
  vm.run()
  t.is(spv(vm), -9)
})

test('IF_FALSE_JUMP: FALSE', (t) => {
  let vm = new VM([
    PUSH, 20, // 0
    PUSH, 21, // 2
    LESS_THAN, // 4
    IF_FALSE_JUMP, 14, // 5
    PUSH, 3, // 7
    PUSH, 5, // 9
    ADD, // 11
    JUMP, 19, // 12
    PUSH, 2, // 14
    PUSH, 12, // 16
    SUBSTRACT, // 18
    PUSH, 1, // 19
    ADD // 20
  ])
  vm.run()
  t.is(spv(vm), 9)
})

test('CALL: call a function', (t) => {
  // a = (x, y, z) => x + y - z
  // 2 * a(4, 1, 3) + a(2, 2, 3) :=> 5
  // -> fp
  //    ip
  //    numArgs
  //    ..
  //    arg2
  //    arg1
  let vm = new VM([
    // function a with address 0
    LOAD, -3, // 0
    LOAD, -4, // 2
    LOAD, -5, // 4
    ADD, // 6
    SUBSTRACT, // 7
    RETURN, // 8

    PUSH, 2, // 9
    PUSH, 4, // 11
    PUSH, 1, // 13
    PUSH, 3, // 15
    CALL, 0, 3, // call function a with arguments num 3
    MULTIPLE,
    PUSH, 2,
    PUSH, 2,
    PUSH, 3,
    CALL, 0, 3,
    ADD
  ])
  vm.run(9)
  t.is(spv(vm), -5)
})

test('makeReadableBytecodes', (t) => {
  const codes = [IF_FALSE_JUMP, 0, JUMP, 0, PUSH, 1, PUSH, 2, CALL, 0, 1]
  t.deepEqual(
    makeReadableBytecodes(codes),
`0 IF_FALSE_JUMP 0
2 JUMP 0
4 PUSH 1
6 PUSH 2
8 CALL 0 1
`
  )
})
