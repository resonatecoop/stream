const cloneDeep = require('clone-deep')

module.exports = sort

function sort (arr, order) {
  const list = cloneDeep(arr)
  switch (order) {
    case 'plays':
      return list.sort((a, b) => b.count - a.count)
    case 'random':
      return list.sort(() => (0.5 - Math.random()))
    default:
      return list
  }
}
