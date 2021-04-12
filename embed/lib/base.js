module.exports = base

/**
 * @description
 * @param {String} path Route path
 * @return {String} Full path
 */

function base (path = '') {
  return '/' + (process.env.APP_BASE || 'embed') + path
}
