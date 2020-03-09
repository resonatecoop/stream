const PlayCount = require('@resonate/play-count')
const renderCounter = require('@resonate/counter')

function updateCounter (props, element) {
  const { count, id } = props

  const playCount = new PlayCount(count)

  const counter = renderCounter(`cid-${id}`)

  playCount.counter = counter

  if (element) {
    const parent = element.parentNode
    parent.replaceChild(playCount.counter, element)
  }
}

module.exports = setPlaycount

function setPlaycount (props) {
  const { id } = props
  for (const counter of [...document.querySelectorAll(`#cid-${id}`)]) {
    updateCounter(props, counter)
  }
}
