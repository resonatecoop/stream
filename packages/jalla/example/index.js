var lazy = require('choo-lazy-view')
var html = require('choo/html')
var choo = require('choo')

var app = choo()

app.use(lazy)
app.use(require('choo-service-worker')('/sw.js'))

app.route('/', main)
app.route('/a', lazy(() => import('./a')))
app.route('/b', lazy(() => import('./b')))

module.exports = app.mount('body')

function main () {
  return html`
    <body class="Home">
      <h1>home</h1>
      <a href="/a">a</a><br>
      <a href="/b">b</a>
    </body>
  `
}
