<h1 align="center">Res( )nate</h1>
<div align="center">
  <strong>stream2own</strong>
</div>

<br />

<div align="center">
  <!-- Standard -->
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"
      alt="Standard" />
  </a>
</div>

## Table of Contents
- [Installation](#installation)
- [Development](#development)
- [Commands](#commands)
- [See Also](#see-also)

## Installation

First, make sure you have the latest version of [node.js](https://nodejs.org/)

You will need to install [lerna](https://github.com/lerna/lerna) tool.

    $ npm instal lerna -g

Then you should install dependencies using the bootstrap command.

    $ lerna bootstrap

## Development

    $ npm run app

## Environment

Setup your env variables

    $ cp .env.example .env

### Nginx

You can find an example [nginx configuration](/docs/nginx/resonate.localhost.conf) file in the docs.

### HTTPS

Secure connection is required to fully test PWA's.
Use this [shell script](/docs/ssl/create-self-signed-ssl.sh) to generate a working self signed certificate for *.resonate.localhost and resonate.localhost.

### Hostname

You must use [beta.resonate.localhost](https://beta.resonate.localhost) or [stream.resonate.localhost](https://stream.resonate.localhost).
These hostnames are whitelisted in CORS config of API v1.

## Commands

Command                | Description                                      |
-----------------------|--------------------------------------------------|
`$ npm run app`        | Start beta app development server
`$ lerna run test`     | Lint, validate deps & run dependency-check for all packages
`$ npm run build:app`  | Compile all beta app files into `beta/dist/`
`$ npm run create`     | Generate a scaffold file
`$ npm run inspect`    | Inspect the bundle's dependencies

## See Also
- [choo](https://github.com/choojs/choo) - sturdy 4kb frontend framework
- [bankai](https://github.com/choojs/bankai) - streaming asset compiler
- [nanohtml](https://github.com/choojs/nanohtml) - HTML template strings for the Browser with support for Server Side Rendering in Node.
  strings
- [nanocomponent](https://github.com/choojs/nanocomponent) - create performant HTML components
- [tachyons](https://github.com/tachyons-css/tachyons) - functional CSS for
  humans
- [sheetify](https://github.com/stackcss/sheetify) - modular CSS bundler for
  `browserify`

## Code style

We use [standard](https://standardjs.com/) as a linter and javascript style guide.
Make sure to add appropriate plugin for your editor (see: [standard#are-there-text-editor-plugins](https://github.com/standard/standard#are-there-text-editor-plugins))

## Contributors

- Augustin Godiscal <auggod@resonate.is>
- Marie <marie@resonate.is>
