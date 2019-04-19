# Theme (dark/light)

We use a subset of tachyons skins classes with a modifier `--dark` or `--light`. 

It's possible to theme background colors, text colors, border colors and fills colors.

To enable dark theme you should add `color-scheme--dark` to the body.

If the browser supports `prefers-color-scheme`, you would not need to add a class to the body unless you want to override the theme set by the user.

```html
<!-- beta/index.html -->
...
<body class="color-scheme--dark">
...
```

```css
/* packages/tachyons/src/_skins-color-scheme */
...
@media (prefers-color-scheme: dark) {
  .black--dark {         color: var(--black); }
  .near-black--dark {    color: var(--near-black); }
  .dark-gray--dark {     color: var(--dark-gray); }
  ...
}

...

.color-scheme--dark {
  & .black--dark {         color: var(--black); }
  & .near-black--dark {    color: var(--near-black); }
  & .dark-gray--dark {     color: var(--dark-gray); }
  ...
}
...

.color-scheme--light {
  & .black--light {         color: var(--black); }
  & .near-black--light {    color: var(--near-black); }
  & .dark-gray--light {     color: var(--dark-gray); }
  ...
}
...
```

## See also

- [tachyons/src/_skins-color-scheme.css](/packages/tachyons/src/_skins-color-scheme.css)
- [tachyons/src/_variables.css](/packages/_variables.css)
