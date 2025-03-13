var babel = require('@babel/core')
var { addHook } = require('pirates')
var clearModule = require('clear-module')

var SCRIPT = /\.js$/
var NODE_MODULES = /node_modules/

module.exports = compile

function compile (state, emit) {
  addHook(hook, { matcher })

  return function (cb) {
    for (const dep of state.deps) {
      if (SCRIPT.test(dep) && !NODE_MODULES.test(dep) && !state.skip(dep)) {
        clearModule(dep)
      }
    }
    cb()
  }

  function matcher (file) {
    if (NODE_MODULES.test(file) || state.skip(file)) return false
    return state.deps.has(file)
  }

  function hook (code, file) {
    try {
      var res = babel.transform(code, {
        filename: file,
        sourceMaps: 'inline',
        plugins: ['dynamic-import-split-require']
      })
      return res.code
    } catch (err) {
      emit('error', err)
      return code
    }
  }
}
