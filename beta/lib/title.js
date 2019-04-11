const separator = ' • '
const title = require('../manifest.json').title

module.exports = (viewName) => {
  return viewName ? viewName + separator + title : title
}
