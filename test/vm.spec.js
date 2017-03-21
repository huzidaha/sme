import test from 'ava'
import VM, {
  ADD,
  SUBSTRACT,
  MULTIPLE,
  DIVIDE,
  CONST,
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

test('CONST instruction', (t) => {
  const vm = new VM([
    CONST, 1,
    CONST, 2,
    CONST, 3
  ])
  vm.run()
  t.deepEqual(vm.stack, [1, 2, 3])
})

test('Math instructions', (t) => {
  const vm = new VM([
    CONST, 1,
    CONST, 2,
    ADD,
    CONST, 21,
    ADD,
    CONST, 48,
    DIVIDE,
    CONST, 3,
    MULTIPLE,
    CONST, 5.5,
    SUBSTRACT
  ])
  vm.run()
  t.is(vm.stack[0], -4)
  t.is(vm.sp, 0)
})

test('PRINT', (t) => {
  const vm = new VM([
    CONST, 20, PRINT
  ])
  vm.run()
  t.is(vm.sp, -1)
})

test('EQUAL_TO', (t) => {
  let vm = new VM([
    CONST, 20,
    CONST, 20,
    EQUAL_TO
  ])
  vm.run()
  t.is(vm.stack[vm.sp], true)
  vm = new VM([
    CONST, 21,
    CONST, 20,
    EQUAL_TO
  ])
  vm.run()
  t.is(vm.stack[vm.sp], false)
})

test('LESS_THAN', (t) => {
  let vm = new VM([
    CONST, 20,
    CONST, 21,
    LESS_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], true)
  vm = new VM([
    CONST, 21,
    CONST, 20,
    LESS_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], false)
})

test('GREATER_THAN', (t) => {
  let vm = new VM([
    CONST, 20,
    CONST, 21,
    GREATER_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], false)
  vm = new VM([
    CONST, 21,
    CONST, 20,
    GREATER_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], true)
})

test('IF_FALSE_JUMP: TRUE', (t) => {
  let vm = new VM([
    CONST, 20, // 0
    CONST, 21, // 2
    GREATER_THAN, // 4
    IF_FALSE_JUMP, 14, // 5
    CONST, 3, // 7
    CONST, 5, // 9
    ADD, // 11
    JUMP, 19, // 12
    CONST, 2, // 14
    CONST, 12, // 16
    SUBSTRACT, // 18
    CONST, 1, // 19
    ADD // 20
  ])
  vm.run()
  t.is(spv(vm), -9)
})

test('IF_FALSE_JUMP: FALSE', (t) => {
  let vm = new VM([
    CONST, 20, // 0
    CONST, 21, // 2
    LESS_THAN, // 4
    IF_FALSE_JUMP, 14, // 5
    CONST, 3, // 7
    CONST, 5, // 9
    ADD, // 11
    JUMP, 19, // 12
    CONST, 2, // 14
    CONST, 12, // 16
    SUBSTRACT, // 18
    CONST, 1, // 19
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

    CONST, 2, // 9
    CONST, 4, // 11
    CONST, 1, // 13
    CONST, 3, // 15
    CALL, 0, 3, // call function a with arguments num 3
    MULTIPLE,
    CONST, 2,
    CONST, 2,
    CONST, 3,
    CALL, 0, 3,
    ADD
  ])
  vm.run(9)
  t.is(spv(vm), -5)
})

test('makeReadableBytecodes', (t) => {
  const codes = [IF_FALSE_JUMP, 0, JUMP, 0, CONST, 1, CONST, 2, CALL, 0, 1]
  t.deepEqual(
    makeReadableBytecodes(codes),
    ['IF_FALSE_JUMP', 0, 'JUMP', 0, 'CONST', 1, 'CONST', 2, 'CALL', 0, 1]
  )
})
