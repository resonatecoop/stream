# Embed app

Minimal beta player for web embeds.

## Embed code

```html
  <iframe
    allow="autoplay *; encrypted-media *; fullscreen *"
    frameborder="0"
    width="400px"
    height="600"
    style="margin:0;border:none;width:400px;height:600px;border: 1px solid #000;"
    sandbox="allow-same-origin allow-scripts"
    src="https://beta.stream.resonate.coop/embed/track/144"
  ></iframe>
```

## Routes

Route prefix is `/embed` by default.

- `/track/{id}`
- `/artist/{id}/releases/{slug}`
- `/u/{id}/playlist/{slug}`

## Environment

Example:

```sh
API_DOMAIN=beta.stream.resonate.localhost
API_PREFIX=/api/v1
APP_HOSTNAME=https://beta.stream.resonate.localhost
SITE_DOMAIN=resonate.localhost
DISABLE_NANOTIMING=no
LOG_LEVEL=debug
```

## Events

- `player:cap`

Save a play count (free 45 sec)

## Commands
Command                | Description                                      |
-----------------------|--------------------------------------------------|
`$ npm start`          | Start the development server
`$ npm test`           | Lint, validate deps & run tests
`$ npm run build`      | Compile all files into `dist/`
`$ npm run create`     | Generate a scaffold file
`$ npm run inspect`    | Inspect the bundle's dependencies
