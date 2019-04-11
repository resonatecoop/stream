const test = require('tape')
const AJV = require('ajv')
const { User } = require('../user')
const ajv = new AJV({
  allErrors: true
})

test('should be a valid user', (t) => {
  t.plan(1)

  const isValid = ajv.validate(User, {
    full_name: 'John Doe',
    display_name: 'JohnD',
    first_name: 'John',
    last_name: 'Doe',
    residence_address: {},
    email: 'john@doe.com',
    username: 'jdoe',
    member: false,
    tags: [],
    userGroups: {
      artists: [],
      labels: []
    },
    avatar: ''
  })

  t.equal(isValid, true)

  t.end()
})
