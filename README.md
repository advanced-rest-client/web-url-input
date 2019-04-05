[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/web-url-input.svg)](https://www.npmjs.com/package/@advanced-rest-client/web-url-input)

[![Build Status](https://travis-ci.org/advanced-rest-client/web-url-input.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/web-url-input)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/web-url-input)


# web-url-input

An element to display a dialog to enter an URL with auto hints

## Example:

```html
<web-url-input></web-url-input>
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/web-url-input
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import './node_modules/@advanced-rest-client/web-url-input/web-url-input.js';
    </script>
  </head>
  <body>
    <web-url-input></web-url-input>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from './node_modules/@polymer/polymer/polymer-element.js';
import './node_modules/@advanced-rest-client/web-url-input/web-url-input.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <web-url-input></web-url-input>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/web-url-input
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
