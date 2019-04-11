# [WIP] Menu button

## Installation

    $ npm install @resonate/menu-button --save

## Usage

```javascript

const menuButton = require('@resonate/menu-button')({
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

const button = menuButton.render({ 
  id: 'super-button',
  orientation: 'left', // popup menu orientation (top, right, left, bottom)
  style: 'blank', (default, blank)
  caret: true, (add dropdown caret class)
  iconName: 'dropdown', // button icon
  text: 'Click' // optional if icon name present
})

```

## See also

- [Original example](https://www.w3.org/TR/2016/WD-wai-aria-practices-1.1-20161214/examples/menu-button/menu-button-1/menu-button-1.html)
