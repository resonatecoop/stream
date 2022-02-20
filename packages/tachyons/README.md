# @resonate/tachyons

A fork of the `tachyons-custom` css library used to style templates and components for Resonate branded user interfaces, such as `stream2own`.
See configuration below for usage with postcss.

## Install

```sh
npm install --save @resonate/tachyons
```

## How to use
We can import `@resonate/tachyons` into our front-end application by simply importing the package into a normal CSS file:
```css
@import '@resonate/tachyons';
```

## Using the library
Using `@resonate/tachyons` is the same as using the standard `tachyons` library. For introductory documentation as to how use `tachyons`, you can head to [the tachyons website](https://tachyons.io/).

`@resonate/tachyons` modifies a handful of pre-existing CSS classes from `tachyons`, and also adds several more:

### Colors
`@resonate/tachyons` changes 7 color classes. Their class names are the same, but their values have been updated:

![resonate tachyons colors](images/colors.png)

### Typography
Font sizing with `@resonate/tachyons` works somewhat differently than it does with regular `tachyons`.

Using `tachyons`, developers can specify which font size to use at different breakpoints using class modifiers. For example, if we wanted to style a `<div>` to render font size `f1` on desktop, `f2` on tablets, and `f3` on mobile, we would write:

```html
<div class="f1-l f2-m f3">
  Hello world
</div>
```

However, with `@resonate/tachyons` developers only have to specify one class name to adhere to Resonate's typography design system. That element's `font-size` will then change automatically over different breakpoints:

```html
<div class="f2">
  Hello world
</div>
```

### Overriding fonts
On rare occasions when you need to override a particular `font-size`, the currently suggested method is to create a `sheetify` class that would override the `font-size` variable at a chosen breakpoint. Note that because `@resonate/tachyons`' font classes also include `letter-spacing` properties, you may also need to override this property too.

### Spacing
`@resonate/tachyons` still uses the same padding and margin classes as `tachyons` (eg. `.ma0`, `.mr2`, `.pa4`), however the variables used to calculate each class have changed.

`@resonate/tachyons` uses the following spacing variables:
```
--spacing-extra-small: 0.533rem;
--spacing-small: 0.867rem;
--spacing-medium: 2.200rem;
--spacing-large: 3.667rem;
--spacing-extra-large: 5.867rem;
--spacing-extra-extra-large: 9.533rem;
--spacing-extra-extra-extra-large: 15.400rem;
```

***(Important! These variables may be subject to change.)***

### Fills
`@resonate/tachyons` adds several classes that allow developers to set a `fill` property on template elements. Using the color variables from earlier, here's a list of available `fill` classes:

```css
.fill-black {      fill: var(--black); }
.fill-near-black { fill: var(--near-black); }
.fill-dark-gray {  fill: var(--dark-gray); }
.fill-mid-gray {   fill: var(--mid-gray); }
.fill-gray {       fill: var(--gray); }
.fill-light-gray { fill: var--light-gray); }
.fill-white {      fill: var(--white); }
```

### Theming

Apply `dark` or `light` theme for backgrounds, text colors, border colors, and fills.
To achieve this, we added `dark` and `light` as a modifier for these classes.
Take a look at `src/utilities/_skins-color-scheme.css` and `src/utilities/_fills-color-scheme.css`

```css
.fill-black--dark {      fill: var(--black); }
.fill-near-black--dark { fill: var(--near-black); }
.fill-dark-gray--dark {  fill: var(--dark-gray); }
.fill-mid-gray--dark {   fill: var(--mid-gray); }
.fill-gray--dark {       fill: var(--gray); }
.fill-light-gray--dark { fill: var--light-gray); }
.fill-white--dark {      fill: var(--white); }
```

By using `@media (prefers-color-scheme: dark)` we can handle browsers with support for dark/light color schemes.
On newer versions of Firefox and Safari from macOs 10.14.3, `dark` or `light` theme is automatically set instead of default `light`.

## Contributors

- Jase <@jasecoop>
- Louis <@louiscenter>
- Augustin Godiscal <@auggod>

## License

MIT
