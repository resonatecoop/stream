# @resonate/player-component

Player component

## Installation

```sh
$ npm i --save @resonate/player-component
```

## Usage

```js

const Player = require('@resonate/player-component')

function (state, emit) {
  return html`
    <div class="bg-black white fixed bottom-0 left-0 right-0 w-100">
      ${state.cache('player').render({
        menu: {
          items: [
            {
              iconName: 'star',
              text: 'favorite',
              toggleState: state.track.fav === 0,
              action: (toggle, data) => {
                emit(toggle ? 'favorite' : 'unfavorite', data.id)
              }
            },
            {
              iconName: 'share',
              text: 'share'
            },
            {
              iconName: 'info',
              text: 'artist profile'
            }
          ]
        }
      })}
    </div>
  `
}

...
```

## Options

- `prefix` A single class or classlist
- `menu` An array of menu item configuration for `@resonate/menu-button`

## Playback control

Player state is exposed in `state.components[componentId]`

Playback state machine can be controlled

```js
...

machine.playback.emit('play')

machine.playback.emit('pause')

```

## Icons

See `@resonate/icon-element`

SVG icons set configuration.

Icon names

- play
- pause
- previous
- next
- volume

## License

MIT

## Author(s)

- Augustin Godiscal <auggod@resonate.is>
