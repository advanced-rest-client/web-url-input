/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '../../@polymer/polymer/lib/legacy/class.js';
import '../../@polymer/paper-input/paper-input.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import {IronOverlayBehavior} from '../../@polymer/iron-overlay-behavior/iron-overlay-behavior.js';
import '../../@polymer/paper-styles/shadow.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * An element to display a dialog to enter an URL with auto hints
 *
 * ### Example
 *
 * ```html
 * <web-url-input purpose="open-browser"></web-url-input>
 * ```
 *
 * ### Styling
 *
 * `<web-url-input>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--web-url-input` | Mixin applied to the element | `{}`
 * `--web-url-input-background-color` | Background color of the element | `#fff`
 * `--web-url-input-input` | Mixin applied to the paper input element | `{}`
 * `--web-url-input-button` | Mixin applied to the paper button element | `{}`
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @appliesMixin Polymer.IronOverlayBehavior
 */
class WebUrlInput extends mixinBehaviors([IronOverlayBehavior], PolymerElement) {
  static get template() {
    return html`
    <style>
    :host {
      background-color: var(--web-url-input-background-color, #fff);
      padding: 20px;
      top: 20px;
      max-width: 90%;
      width: 100%;
      @apply --shadow-elevation-6dp;
      @apply --web-url-input;
    }

    .inputs {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    .editor {
      position: relative;
    }

    .main-input {
      @apply --layout-flex;
      @apply --web-url-input-input;
    }

    .action-button {
      @apply --action-button;
      @apply --web-url-input-button;
    }
    </style>
    <div class="editor">
      <div class="inputs">
        <paper-input
          label="Enter URL"
          value="{{value}}"
          class="main-input"
          type="url"
          autofocus=""
          required=""
          auto-validate=""
          error-message="The URL is required."></paper-input>
        <paper-button class="action-button" on-click="_onEnter">Open</paper-button>
      </div>
      <paper-autocomplete id="ac" loader=""
        open-on-focus=""
        target="[[_autocompleteTarget]]"
        on-query="_autocompleteQuery"
        opened="{{suggesionsOpened}}"></paper-autocomplete>
    </div>`;
  }

  static get properties() {
    return {
      // Current URL value.
      value: {
        type: String,
        notify: true
      },
      /**
       * Input target for the `paper-autocomplete` element.
       *
       * @type {HTMLElement}
       */
      _autocompleteTarget: Object,
      // True when a suggestion box for the URL is opened.
      suggesionsOpened: {
        type: Boolean,
        notify: true
      },
      /**
       * A value to be set in the detail object of `open-web-url` custom event.
       * The editor can server different purposes. Re-set the purpose to inform
       * the application about purpose of the event.
       */
      purpose: String
    };
  }

  constructor() {
    super();
    this._keyDownHandler = this._keyDownHandler.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._keyDownHandler);
    if (!this._autocompleteTarget) {
      this._autocompleteTarget = this.shadowRoot.querySelector('.main-input');
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._keyDownHandler);
  }

  _autocompleteQuery(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.detail.value) {
      e.target.source = [];
      return;
    }
    this._makeQuery(e.detail.value);
  }

  _makeQuery(q) {
    const e = new CustomEvent('url-history-query', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        q
      }
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      console.warn(`URL history model not found`);
      this.$.ac.source = [];
      return;
    }
    if (e.detail.error) {
      console.error(e.detail.error);
      this.$.ac.source = [];
      return;
    }
    e.detail.result
    .then((result) => {
      result = result.map((item) => item.url);
      this.$.ac.source = result;
    })
    .catch(() => {
      this.$.ac.source = [];
    });
  }

  _keyDownHandler(e) {
    if (e.composedPath()[0].nodeName !== 'INPUT') {
      return;
    }
    if (e.key === 'Enter' || e.keyCode === 13) {
      this._onEnter();
    }
  }
  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send an `open-web-url` event.
   */
  _onEnter() {
    if (this.suggesionsOpened) {
      return;
    }
    this.dispatchEvent(new CustomEvent('open-web-url', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        url: this.value,
        purpose: this.purpose
      }
    }));
    this.opened = false;
  }

  /**
   * Fired when the URL has been accepted
   *
   * @event open-web-url
   * @param {String} url The URL to open
   * @param {String} purpose Value of the `purpose` property.
   */
}
window.customElements.define('web-url-input', WebUrlInput);
