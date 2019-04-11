# SVG Icons

## How to include an svg icon

```js
// some-element.js

const html = require('choo/html')
const icon = require('./icon')

function someElement () {
  return html`
    <div>
      ${icon('heart', { 'class':'icon icon--md icon--green'})}
    </div>
}

module.exports = someElement

```

## How icons are loaded

We currently use an svg icon set within a template element loaded with an HTML import.

```html
<!-- index.html -->
...
<link rel="import" href="/assets/svg-icons.html" id="icons">
...
```
## Related files

- [/plugins/import-svg-icons.js](/plugins/import-svg-icons.js)
- [/assets/svg-icons.html](/assets/svg-icons.html)
- [/styles/icons.css](/assets/svg-icons.html)
