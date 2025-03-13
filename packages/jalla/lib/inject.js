var through = require('through2')
var transform = require('transform-ast')
var sourcemap = require('convert-source-map')

module.exports = inject

// create browserify transform which injects require for given module
// (str, str?) -> fn
function inject (name, target) {
  return function (filename) {
    if (target && filename !== target) return through()

    var src = ''

    return through(onwrite, onend)

    function onwrite (chunk, enc, cb) {
      src += chunk
      cb(null)
    }

    function onend (cb) {
      var result = transform(src, function node (node) {
        if (node.type === 'Program') {
          node.edit.prepend(`require('${name}');\n`)
        }
      })
      var comment = sourcemap.fromObject(result.map).toComment()
      this.push(result.toString() + '\n' + comment)
      cb()
    }
  }
}
