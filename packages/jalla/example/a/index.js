var html = require('choo/html')

module.exports = view

function view (state, emit) {
  return html`
    <body class="ViewA">
      <h1>view a</h1>
      <a href="/">home</a><br>
      <a href="/b">b</a>
    </body>
  `
}
