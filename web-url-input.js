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
import {IronOverlayBehavior} from '../../@polymer/iron-overlay-behavior/iron-overlay-behavior.js';
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
    return html`<style>
    :host {
      background-color: var(--web-url-input-background-color, #fff);
      padding: 20px;
      top: 20px;
      max-width: 90%;
      width: 100%;
      box-shadow: var(--box-shadow-6dp);
    }

    .inputs {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .editor {
      position: relative;
    }

    .main-input {
      flex: 1;
      flex-basis: 0.000000001px;
    }

    .action-button {
      background-color: var(--action-button-background-color);
      background-image: var(--action-button-background-image);
      color: var(--action-button-color);
      transition: var(--action-button-transition);
    }

    .action-button:hover,
    .action-button:focus {
      background-color: var(--action-button-hover-background-color);
      color: var(--action-button-hover-color);
    }

    .action-button[disabled] {
      background: var(--action-button-disabled-background-color);
      color: var(--action-button-disabled-color);
      cursor: auto;
      pointer-events: none;
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
        <paper-button class="action-button" on-click="_onEnter" disabled\$="[[!hasValue]]">Open</paper-button>
      </div>
      <paper-autocomplete
        id="ac"
        loader=""
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
      purpose: String,
      /**
       * True when the input has any value.
       * @type {Boolean}
       */
      hasValue: {type: Boolean, value: false, computed: '_computeHasValue(value)'}
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

  _dispatch(type, detail) {
    const e = new CustomEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail
    });
    this.dispatchEvent(e);
    return e;
  }

  _dispatchQueryEvent(q) {
    return this._dispatch('url-history-query', {
      q
    });
  }

  _dispatchOpenEvent() {
    return this._dispatch('open-web-url', {
      url: this.value,
      purpose: this.purpose
    });
  }

  _makeQuery(q) {
    const e = this._dispatchQueryEvent(q);
    if (!e.defaultPrevented) {
      console.warn('URL history model not found');
      this.$.ac.source = [];
      return;
    }
    e.detail.result
    .then((result) => {
      result = result.map((item) => item.url);
      this.$.ac.source = result;
    })
    .catch((cause) => {
      console.warn(cause);
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
    this._dispatchOpenEvent();
    this.opened = false;
  }

  _computeHasValue(value) {
    return !!value;
  }
  /**
   * Fired when the URL has been accepted
   *
   * @event open-web-url
   * @param {String} url The URL to open
   * @param {String} purpose Value of the `purpose` property.
   */
  /**
   * Dispatched to query for URL history.
   *
   * @event url-history-query
   * @param {String} q
   */
}
window.customElements.define('web-url-input', WebUrlInput);