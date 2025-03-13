var html = require('choo/html')

module.exports = view

function view (state, emit) {
  return html`
    <body class="ViewB">
      <h1>view b</h1>
      <a href="/">home</a><br>
      <a href="/a">a</a>
    </body>
  `
}
