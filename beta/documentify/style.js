const hstream = require('hstream')

module.exports = transform

function transform (opts) {
  return hstream({
    body: {
      _prependHtml: `
        <style>
          [unresolved] {
            opacity: 1;
          }
          @supports (-moz-appearance:none) {
            .ff-no-fouc {
              opacity: 1;
            }
          }
        </style>
      `
    }
  })
}
