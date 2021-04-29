# Share menu button component

Resonate share menu with some extra items.

Will trigger a `menu-button` on desktop and a `dialog` on smaller screens. The reasoning is that while the menu button works well on desktop, on mobile it's not the case. The menu button can appear off screen and we need to determine a position direction. Othewise, we would need to recenter the view which may not be a better solution.

## Usage

```js
  // ...
  state.cache(ShareMenuButon, 'release-share-menu-button').render({
    items: [], // additional menu items
    selection: ['share', 'link', 'embed'], // the list of menu items you want
    data: {
      image: // some custom image src,
      title: 'Resonate',
      text: 'Stream fair',
      url: 'https://resonate.coop',
    }, // shareData
    orientation: 'left' // position orientation for menu button only
  })
```

## TODO

- Find other name than 'share'

## Dependencies

- @resonate/button-element
- @resonate/button-component
- @resonate/menu-buton-component (renamed from @resonate/menu-button)
- @resonate/dialog-component 
