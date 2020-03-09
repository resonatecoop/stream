import {
  nextMultiple,
  calculateCost,
  calculateRemainingCost,
  formatCredit
} from '../src'
import test from 'tape'

test('next multiple of number', (t) => {
  t.plan(5)

  t.equal(nextMultiple(3, 10), 10)
  t.equal(nextMultiple(12, 10), 20)
  t.equal(nextMultiple(24, 10), 30)
  t.equal(nextMultiple(24, 20), 40)
  t.equal(nextMultiple(24, 100), 100)

  t.end()
})

test('calculate cost', (t) => {
  t.plan(10)

  t.equal(calculateCost(0), 2)
  t.equal(calculateCost(1), 4)
  t.equal(calculateCost(2), 8)
  t.equal(calculateCost(3), 16)
  t.equal(calculateCost(4), 32)
  t.equal(calculateCost(5), 64)
  t.equal(calculateCost(6), 128)
  t.equal(calculateCost(7), 256)
  t.equal(calculateCost(8), 512)
  t.equal(calculateCost(9), 0)

  t.end()
})

test('calculate remaining cost', (t) => {
  t.plan(10)

  t.equal(calculateRemainingCost(0), 1022)
  t.equal(calculateRemainingCost(1), 1020)
  t.equal(calculateRemainingCost(2), 1016)
  t.equal(calculateRemainingCost(3), 1008)
  t.equal(calculateRemainingCost(4), 992)
  t.equal(calculateRemainingCost(5), 960)
  t.equal(calculateRemainingCost(6), 896)
  t.equal(calculateRemainingCost(7), 768)
  t.equal(calculateRemainingCost(8), 512)
  t.equal(calculateRemainingCost(9), 0)

  t.end()
})

test('format credit', (t) => {
  t.plan(3)

  t.equal(formatCredit(2), '0.0020')
  t.equal(formatCredit(74), '0.0740')
  t.equal(formatCredit(40088), '40.0880')

  t.end()
})
