import test from 'ava'
import VM from '../src/vm'
import {
  CONST, ADD, SUBSTRACT, DIVIDE, MULTIPLE,
  PRINT,
  LESS_THAN, GREATER_THAN, EQUAL_TO,
  JUMP, IF_FALSE_JUMP
} from '../src/instructions'

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
  t.is(vm.stack[0], -0.5)
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
  t.is(vm.stack[vm.sp], false)
  vm = new VM([
    CONST, 21,
    CONST, 20,
    LESS_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], true)
})

test('GREATER_THAN', (t) => {
  let vm = new VM([
    CONST, 20,
    CONST, 21,
    GREATER_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], true)
  vm = new VM([
    CONST, 21,
    CONST, 20,
    GREATER_THAN
  ])
  vm.run()
  t.is(vm.stack[vm.sp], false)
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
  t.is(spv(vm), 9)
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
  t.is(spv(vm), 11)
})
