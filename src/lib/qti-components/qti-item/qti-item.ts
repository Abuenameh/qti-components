import { createContext } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ItemContext } from './qti-item.context';
import { QtiItemContextConsumer } from './qti-item.context.controller';

@customElement('qti-item')
export class QtiItem extends LitElement {
  // @provide({ context: itemContext })
  // @state()
  // private _context: ItemContext;

  private _controller = new QtiItemContextConsumer(this, {
    context: createContext<ItemContext>('item'),
    subscribe: true
    // callback: value => (this._context = value)
  });

  render() {
    return html`<slot></slot>`;
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
