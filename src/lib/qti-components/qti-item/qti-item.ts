import { Signal } from '@lit-labs/preact-signals';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ItemContext } from './qti-item.context';
import { QtiItemContextConsumer } from './qti-item.context.controller';

@customElement('qti-item')
export class QtiItem extends LitElement {
  @property({ type: Object, attribute: false })
  public context: Signal<ItemContext>;

  private _controller = new QtiItemContextConsumer(this);

  render() {
    return html`
      <h1>QTI Item</h1>
      <pre>${JSON.stringify(this.context, null, 4)}</pre>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
