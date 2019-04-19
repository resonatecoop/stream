# @resonate/choo-plugins

Library for all choo plugins in resonate frontend projects

- Full screen
- Gestures
- Offline/online detection
- Resize event
- Tabbing
- Theme
- Visibility

## Installation

```sh
$ npm i --save @resonate/choo-plugins
```

## Usage

```javascript

  const { offlineDetect: offlineDetectPlugin } = require('@resonate/choo-plugins')

  const app = choo()

  app.use(offlineDetectPlugin())

```

## License

MIT

## Author(s)

- Augustin Godiscal <auggod@resonate.is>
