require('@babel/polyfill')

const test = require('tape')
// import { Track } from '@resonate/schemas/track'
const factoryGenerator = require('../')

const api = factoryGenerator(
  {
    tracks: {
      getTracks: {
        path: '/tracks'
      }
    },
    plays: {
      getPlays: {
        path: '/users/[:uid]/plays',
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            }
          }
        }
      }
    }
  },
  {
    mode: 'cors',
    domain: 'api.resonate.localhost',
    scheme: 'https://',
    prefix: '/v1',
    version: 1,
    timeout: 10000
  }
)

test('api should look right', async t => {
  t.plan(4)
  t.equal(typeof api, 'object', 'api should be an object')
  t.equal(typeof api.plays, 'object', 'api.plays method should be an object')
  t.equal(typeof api.plays.getPlays, 'function', 'api.plays.add method should be a function')
  t.equal(api.version, 1, 'api version should be 1')
})

test('can send request and get some tracks', async t => {
  t.plan(1)

  try {
    const resp = await api.tracks.getTracks()
    t.ok(resp.data !== null, 'Should return some data')
  } catch (err) {
    t.end(err)
  }
})

test('can set params', async t => {
  t.plan(1)

  try {
    const resp = await api.plays.getPlays({ uid: 2124 })
    // it returns unauthorized if uid was correctly set, otherwise it may be 404
    t.ok(resp.status === 401, 'Should return unauthorized')
  } catch (err) {
    t.end(err)
  }
})
