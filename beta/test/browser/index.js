const tape = require('tape')
const html = require('choo/html')

const PlayCount = require('../../components/play-count-class')
const calculateCost = require('../../components/player/calculateCost')
const renderCounter = () => html`
  <svg class="counter" viewbox="0 0 16 16" width="18" height="18">
    <circle cx="2" cy="3" r="2" fill="#909090" />
    <circle cx="9" cy="3" r="2" fill="#909090" />
    <circle cx="16" cy="3" r="2" fill="#909090" />
    <circle cx="2" cy="9" r="2" fill="#909090" />
    <circle cx="9" cy="9" r="2" fill="#909090" />
    <circle cx="16" cy="9" r="2" fill="#909090" />
    <circle cx="2" cy="16" r="2" fill="#909090" />
    <circle cx="9" cy="16" r="2" fill="#909090" />
    <circle cx="16" cy="16" r="2" fill="#909090" />
  </svg>
`

tape('play count', function (t) {
  t.test('9 play count', function (t) {
    t.plan(4)

    const counter = renderCounter()

    const playcount = PlayCount(9)

    playcount.counter = counter
    playcount.circles = counter.querySelectorAll('circle')

    document.body.insertBefore(counter, document.body.firstChild)

    t.equal(playcount.counter.children.length, 9)
    t.equal(playcount.counter.firstChild.getAttribute('fill'), '#54EB80')
    t.equal(playcount.counter.lastChild.getAttribute('fill'), '#54EB80')
    t.equal(playcount.counter.childNodes[6].getAttribute('fill'), '#54EB80')
  })

  t.test('no play count', function (t) {
    t.plan(4)

    const counter = renderCounter()

    const playcount = PlayCount(0)

    playcount.counter = counter
    playcount.circles = counter.querySelectorAll('circle')

    document.body.insertBefore(counter, document.body.firstChild)

    t.equal(playcount.counter.children.length, 9, 'should have 9 elements')
    t.equal(playcount.counter.firstChild.getAttribute('fill'), '#909090', 'first child should have #909090 fill')
    t.equal(playcount.counter.lastChild.getAttribute('fill'), '#909090', 'last child should have #909090 fill')
    t.equal(playcount.counter.childNodes[6].getAttribute('fill'), '#909090', '6th child should have #909090 fill')
  })

  t.test('single play count', function (t) {
    t.plan(4)

    const counter = renderCounter()

    const playcount = PlayCount(1)

    playcount.counter = counter
    playcount.circles = counter.querySelectorAll('circle')

    document.body.insertBefore(counter, document.body.firstChild)

    t.equal(playcount.counter.children.length, 9)
    t.equal(playcount.counter.firstChild.getAttribute('fill'), '#909090')
    t.equal(playcount.counter.lastChild.getAttribute('fill'), '#909090')
    t.equal(playcount.counter.childNodes[6].getAttribute('fill'), '#54EB80')
  })
})

tape('calculate total cost', function (t) {
  t.test('cost should be correct', function (t) {
    t.plan(11)
    t.equal(calculateCost(0), '.002')
    t.equal(calculateCost(1), '.004')
    t.equal(calculateCost(2), '.008')
    t.equal(calculateCost(3), '.016')
    t.equal(calculateCost(4), '.032')
    t.equal(calculateCost(5), '.064')
    t.equal(calculateCost(6), '.128')
    t.equal(calculateCost(7), '.256')
    t.equal(calculateCost(8), '.512')
    t.equal(calculateCost(9), 'Free')
    t.equal(calculateCost(10), 'Free')
    t.end()
  })
})

/*

test('should fail', function (t) {
  t.plan(1)
  try {
    clock(-1)
    t.fail('should throw err')
  } catch (e) {
    t.equal(e.message, 'Duration should not be lower than 0')
  }
  t.end()
})

*/
