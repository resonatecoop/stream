# @resonate/icon-element

Render an svg element from an SVG icons set

## Installation

```sh
npm i --save @resonate/icon-element
```

## Usage

```javascript

const html = require('nanohtml')
const icon = require('@resonate/icon-element')

module.exports = () => html`
  <div>
    ${icon('logo', { 'class': 'icon icon--xs fill-black' })} 
  </div>
`

```

## SVG icons set example

```html
...

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none" width="100" height="100">
  <symbol viewBox="0 0 100 100" id="icon-logo">
    <path d="M100 50c0-12.9-5.5-24.5-14.2-33l-18 17.3a21.7 21.7 0 0 1 0 31.5l18 17.3a45.7 45.7 0 0 0 14.2-33zm-74.6 0c0-6 2.6-11.6 6.8-15.7L14.2 17a45.7 45.7 0 0 0 0 66.1l18-17.3c-4.2-4-6.8-9.6-6.8-15.7z"/>
  </symbol>
</svg>
```

## License

MIT

## Author(s)

- Augustin Godiscal <auggod@resonate.is>
