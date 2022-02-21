const hstream = require('hstream')

module.exports = transform

/**
 * Need to prepend charset to the start of the document
 * need to remove dupplicate charset from bankai?
 */

function transform (opts) {
  return hstream({
    head: {
      _prependHtml: `
        <meta charset="utf-8">
      `
    }
  })
}
