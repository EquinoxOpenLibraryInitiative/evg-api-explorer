# Evergreen API Explorer

This app displays metadata from the API of a running [Evergreen](https://evergreen-ils.org)
server.

## Usage

After launching the app, enter the hostname of an Evergreen system and click the
"Connect to Evergreen" button. Once connected, choose an Evergreen service from the
dropdown and optionally enter a search filter, then click the "Fetch API Information"
button.

## Installation

To build this app:

```sh
npm install
```

If you have a running Evergreen system, it is most convenient to then copy
the compiled app somewhere under `/openils/var/web`. For example,

```sh
rsync -vaHx dist/ /openils/var/web/api-explorer/
```

The API explorer can then be found under `https//HOST/api-explorer/`.

If you need to run this app on a host different from your Evergreen server,
at present some CORS headers need to be set on the Evergreen:

```conf
<IfModule mod_headers.c>
    Header append Access-Control-Allow-Origin "*"
    Header append Access-Control-Allow-Headers "*"
    Header append Access-Control-Expose-Headers "*"
</IfModule>
```

Note that these CORS settings may be more permissive than you would care
to have in production.

A future version of the explorer may provide proxy so that CORS considerations
don't apply.

## Developing

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

### Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Project Setup

```sh
npm install
```

#### Compile and Hot-Reload for Development

```sh
npm run dev
```

#### Type-Check, Compile and Minify for Production

```sh
npm run build
```

#### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Copyright

Copyright (c) 2022 Equinox Open Library Initiative, Inc.

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public 
License along with this program; if not, write to the Free 
Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
Boston, MA 02110-1301 USA