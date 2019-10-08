const hyperstream = require('hstream')
const dedent = require('dedent')

module.exports = document

function document (state) {
  console.log(state)
  return hyperstream({
    'meta[name="viewport"]': {
      content: 'width=device-width, initial-scale=1, viewport-fit=cover'
    },
    head: {
      _prependHtml: dedent`
        ${process.env.STYLE_LIST}
      `
    }
  })
}
