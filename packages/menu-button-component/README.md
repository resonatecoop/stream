# Menu button component

Render a menu button.

## Installation (old package)

```sh
npm i --save @resonate/menu-button
```

Renamed to @resonate/menu-button-component (not published yet)

## Usage

```javascript
const MenuButton = require('@resonate/menu-button-component')

module.exports = (state, emit) => {
  const menuButton = state.cache(MenuButton, 'super-menu-button')

  const button = menuButton.render({ 
    id: 'super-button',
    orientation: 'left', // popup menu orientation (top, right, left, bottom)
    style: 'blank', (default, blank)
    iconName: 'dropdown', // button icon
    text: 'Click' // optional if icon name present,
    hover: false, // disabled activation on mousehover
    items: [
      { iconName: 'star', text: 'favorite', actionName: 'favorite' },
      { iconName: 'share', text: 'share', actionName: 'share' },
      { iconName: 'plus', text: 'add to playlist', actionName: 'add' }
    ],
    updateLastAction (actionName) {
      const eventName = actionName
      emit(eventName, { props })
    } 
  })

  return button
}

```

## See also

- [Original example](https://www.w3.org/TR/2016/WD-wai-aria-practices-1.1-20161214/examples/menu-button/menu-button-1/menu-button-1.html)

## License

MIT

## Author(s)

- Augustin Godiscal <auggod@resonate.is>
