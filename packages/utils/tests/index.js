import { nextMultiple } from '../src'
import test from 'tape'

test('next multiple of number', (t) => {
  t.plan(1)

  t.equal(nextMultiple(3), 20)

  t.end()
})
