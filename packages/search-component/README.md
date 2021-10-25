# @resonate/search-component

## Installation

```sh
$ npm i --save @resonate/search-component
```

## Usage

```js
const html = require('choo/html')
const Search = require('@resonate/search-component')

module.exports = () => {
  return html`
    state.cache(Search, 'search-component').render({ tags: ['techno', 'electro'] })
  `
`

```

## License

MIT

## Author(s)

- Augustin Godiscal <auggod@resonate.is>
