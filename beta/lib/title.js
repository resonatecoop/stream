const separator = ' • '
const title = process.env.APP_TITLE

module.exports = (viewName) => {
  if (viewName === title) return title
  return viewName ? viewName + separator + title : title
}
