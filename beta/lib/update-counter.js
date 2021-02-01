const PlayCount = require('@resonate/play-count')
const renderCounter = require('@resonate/counter')

module.exports = props => {
  const { id, count } = props

  for (const element of [...document.querySelectorAll(`svg[data-cid="cid-${id}"]`)]) {
    if (element) {
      const playCount = new PlayCount(count)
      const counter = renderCounter(`cid-${id}`)
      playCount.counter = counter
      const parent = element.parentNode
      parent.replaceChild(playCount.counter, element)
    }
  }
}
