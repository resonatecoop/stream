# CSS

## SCSS, SASS

You can use SCSS or SASS instead of css

## Variables

```css

:root {
  /* Resonate colors */
  --color-green: hsl(137, 79%, 63%); /* #54EB80 */
  --color-violet: hsl(226, 50%, 73%); /* #97A7DC */  
  --color-yellow: hsl(65, 95%, 83%); /* #F6FDAC */  
  --color-lightGrey: hsl(180, 6%, 85%); /* #D5DADA */
  --color-darkGrey: hsl(0, 0%, 25%); /* #414141 */
  --color-white: hsl(0, 0%, 100%); /* #FFFFF */
}

.green {
  color: var(--color-green);
}

```

## Themes

```html
...
<body data-theme="light">
...
```

```css

[data-theme="darker"] {
  --body-color: var(--color-white);
}

```

## Related files

- [/index.js](/index.js)
- [/styles/range-slider.scss](/styles/range-slider.scss)
- [/styles/resonate-colors](/styles/resonate-colors)
- [/plugins/theme.js](/plugins/theme.js)
