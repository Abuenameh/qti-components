import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { QtiItemContextConsumer } from './qti-item.context.controller';

@customElement('qti-item')
export class QtiItem extends LitElement {
  private _controller = new QtiItemContextConsumer(this, {
    callback: value => console.log('QtiItem callback: ', value)
  });

  render() {
    return html`
      <pre>${JSON.stringify(this._controller.value, null, 4)}</pre>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}

// @slotchange=${e => {
//   console.log(this.firstElementChild);
//   this._context = {
//     href: this.getAttribute('href'),
//     identifier: this.getAttribute('identifier'),
//     variables: itemContextVariables
//   };
// }}

// public set variables(value: VariableValue<string | string[] | null>[]) {
//   if (!Array.isArray(value) || value.some(v => !('identifier' in v))) {
//     console.warn('variables property should be an array of VariableDeclaration');
//     return;
//   }

//   this._context = {
//     ...this._context,
//     variables: this._context.variables.map(variable => {
//       const matchingValue = value.find(v => v.identifier === variable.identifier);
//       if (matchingValue) {
//         return { ...variable, ...matchingValue };
//       }
//       return variable;
//     })
//   };
// }
