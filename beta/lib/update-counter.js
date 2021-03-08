const PlayCount = require('@resonate/play-count')
const renderCounter = require('@resonate/counter')
const morph = require('nanomorph')

module.exports = props => {
  const { id, count = 0 } = props

  for (const element of [...document.querySelectorAll(`svg[data-cid="cid-${id}"]`)]) {
    const playCount = new PlayCount(count)
    const counter = renderCounter(`cid-${id}`)
    playCount.counter = counter
    morph(element, playCount.counter)
  }
}
