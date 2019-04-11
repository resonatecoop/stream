const test = require('tape')
const AJV = require('ajv')
const { Track } = require('../track')
const ajv = new AJV({
  allErrors: true
})

test('should be a valid track', (t) => {
  t.plan(1)

  const isValid = ajv.validate(Track, {
    title: 'Capitalism Crashed'
  })

  t.equal(isValid, true)

  t.end()
})
