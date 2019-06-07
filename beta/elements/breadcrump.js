const html = require('choo/html')

module.exports = (props) => {
  const { href, text } = props
  return html`
    <div class="breadcrump mv3">
      <a class="link b f5 dim" href=${href}>${text}</a>
    </div>
  `
}
