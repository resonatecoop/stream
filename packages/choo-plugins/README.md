# Library for all choo plugins in resonate frontend projects

- Full screen
- Gestures
- Offline/online detection
- Resize event
- Tabbing
- Theme
- Visibility

# Usage

```javascript

  const { offlineDetect: offlineDetectPlugin } = require('@resonate/choo-plugins')

  const app = choo()

  app.use(offlineDetectPlugin())

```
