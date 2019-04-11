# Fonts

Webfonts are preloaded using `'rel="preload"'`

```html
...
<link rel="preload" as="font" crossorigin="" href="/assets/fonts/avertastd-semibold-webfont.woff2">
...
```

```css
@font-face {
  font-family: 'Averta';
  src: url('/assets/fonts/avertastd-thin-webfont.eot');
  src: url('/assets/fonts/avertastd-thin-webfont.eot?#iefix') format('embedded-opentype'),
        url('/assets/fonts/avertastd-thin-webfont.woff2') format('woff2'),
        url('/assets/fonts/avertastd-thin-webfont.woff') format('woff'),
        url('/assets/fonts/avertastd-thin-webfont.ttf') format('truetype'),
        url('/assets/fonts/avertastd-thin-webfont.svg#averta_stdthin') format('svg');
  font-weight: 200;
  font-style: normal;
}
```

## Related files

- [/assets/fonts/**](/assets/fonts)
- [/styles/fonts.css](/styles/fonts.css)