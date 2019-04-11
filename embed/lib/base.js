module.exports = (path = '') => {
  return '/' + (process.env.APP_BASE || 'embed') + path
}
