# Resonate schemas (v2 api)

## Usage with api v1

```javascript

const adapter = require('@resonate/schemas/adapters/v1/track')

const track = adapter({
  name: 'dedede'
})

console.log(track.title) // 'dede'

```
