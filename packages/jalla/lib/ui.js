var ora = require('ora')
var pretty = require('pretty-bytes')
var interactive = require('is-interactive')

var PADDING = 2
var SPINNER = {
  interval: 120,
  frames: ['⬘', '⬗', '⬙', '⬖']
}

module.exports = ui

function ui (app) {
  var bundling = new Set()
  var current = null
  var spinner = ora({
    text: 'Initializing',
    spinner: SPINNER,
    color: 'reset'
  })

  if (interactive()) spinner.start()

  app.on('error', function (err) {
    spinner.stopAndPersist({
      symbol: '◇',
      text: err.stack || err.message || err
    })
  })

  app.on('warning', function (warning) {
    spinner.stopAndPersist({
      symbol: '▲',
      text: warning.stack || warning.message || warning
    })
  })

  app.pipeline.on('*', function (event, ...args) {
    var [label, name] = event.split(':')
    if (name === 'progress') {
      bundling.add(args[0])
    } else if (name === 'start') {
      current = label
      bundling.clear()
    } else if (name === 'end') {
      current = null
    } else if (name === 'asset') {
      bundling.delete(args[0])
      const id = args[0]
      const asset = app.context.assets.get(id)
      const suffix = ` [${pretty(asset.size)}]`
      spinner.stopAndPersist({
        symbol: '◆',
        text: truncate(id, suffix.length) + suffix
      })
    } else if (name === 'error') {
      app.emit('error', args[0])
    } else if (name === 'warning') {
      app.emit('warning', args[0])
    }
    if (current && interactive()) spinner.start(current)
    else spinner.stop()
  })

  app.on('timing', function (time, ctx) {
    var url = ctx.url
    var prefix = `${ctx.method} ${ctx.status} `
    var suffix = ` [${time} ms]`

    spinner.stopAndPersist({
      symbol: '◀︎',
      text: prefix + truncate(url, prefix.length + suffix.length) + suffix
    })
    if (current && interactive()) spinner.start(current)
  })

  app.on('start', function (port) {
    if (app.env === 'development') {
      spinner.stopAndPersist({
        symbol: '◆',
        text: `Server listening at http://localhost:${port}`
      })
    } else {
      spinner.stopAndPersist({
        symbol: '◆',
        text: `Server listening on port ${port}`
      })
    }
    if (current && interactive()) spinner.start(current)
  })
}

// truncate slash delimited strings
// (str, num?) -> str
function truncate (str, padding = 0) {
  var space = process.stdout.columns - PADDING - padding

  if (str.length > space) {
    // try fit in stdout by trimming each path segment
    str = str.split('/').map(function (segment) {
      return segment.length > 16 ? segment.substr(0, 16) + '…' : segment
    }).join('/')
  }

  if (str.length > space) {
    // just truncate the whole thing if still too long
    str = str.substr(0, space - 1).replace(/\/?…?$/, '…')
  }

  return str
}
