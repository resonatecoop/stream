const separator = ' • '
const title = 'Resonate'

module.exports = (viewName) => {
  if (viewName === title) return title
  return viewName ? viewName + separator + title : title
}
