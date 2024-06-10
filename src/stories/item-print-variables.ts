import { Signal } from '@lit-labs/preact-signals';
import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ItemContext, itemContext } from '../lib/qti-components/qti-assessment-item/qti-item.context';

@customElement('item-print-variables')
export class ItemPrintVariables extends LitElement {
  @consume({ context: itemContext })
  @state()
  public itemContext?: Signal<ItemContext>;

  render() {
    return html` <pre>${JSON.stringify(this.itemContext, null, 2)}</pre> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'item-print-variables': ItemPrintVariables;
  }
}
