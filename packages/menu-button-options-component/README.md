# Menu button options component

Resonate menu button options component.

Will trigger a `menu-button` on desktop and a `dialog` on smaller screens. The reasoning is that while the menu button works well on desktop, on mobile it's not the case. The menu button can appear off screen and we need to determine a position direction. Othewise, we would need to recenter the view which may not be a better solution.

## Installation (not published yet)

```sh
npm install @resonate/menu-button-options-component --save
```

## Usage

```js
  // ...
  state.cache(MenuButtonOptions, 'release-menu-button-options').render({
    items: [], // additional menu items
    selection: ['share', 'link', 'embed'], // the list of menu items you want
    data: {
      image: // some custom image src,
      title: 'Resonate',
      text: 'Stream fair',
      url: 'https://resonate.coop',
      id: 144,
      creator_id: 1056,
      count: 9
    }, // any relevant data for all menu items
    orientation: 'left' // position orientation for menu button only
  })
```

## Test (standard, dependency-check, ...)

```sh
npm run test --workspace "@resonate/menu-button-options-component"
```

## Dev

Run example app with jalla.

```sh
npm run dev --workspace "@resonate/menu-button-options-component"
```

## See also

- [@resonate/menu-button-component](../packages/menu-button-component)

## License

MIT
