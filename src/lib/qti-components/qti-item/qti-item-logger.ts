import { LitElement, html } from 'lit';
import { customElement, queryAssignedElements, state } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';
import { QtiItem } from './qti-item';
import { ItemContext } from './qti-item.context';

@customElement('qti-item-logger')
export class QtiItemLogger extends LitElement {
  @queryAssignedElements({ flatten: true, selector: 'qti-assessment-item' })
  itemConsumer: Array<QtiAssessmentItem>;

  @queryAssignedElements({ flatten: true, selector: 'qti-item' })
  providerItem: Array<QtiItem>;

  @state()
  arrayWithEvents = [];

  providers: { cont: { __context__: ItemContext }; prov: ItemContext }[] = [];

  constructor() {
    super();
    this.addEventListener('qti-response-changed', (event: CustomEvent) => {
      this.arrayWithEvents = [...this.arrayWithEvents, event.detail];
    });
    this.addEventListener('qti-outcomes-changed', (event: CustomEvent) => {
      this.arrayWithEvents = [...this.arrayWithEvents, event.detail];
    });
  }

  changeRange(eventIndex: number) {
    const eventsUntilEventIndex = this.arrayWithEvents.slice(0, eventIndex);

    eventsUntilEventIndex.forEach(event => {
      this.providerItem[0].dispatchEvent(new CustomEvent('response-event', { detail: event }));
    });
  }

  render() {
    return html`
      <slot></slot>

      <input
        type="range"
        @input=${e => this.changeRange(e.target.value)}
        min="0"
        max=${this.arrayWithEvents.length}
        value="0"
      />

      <h3>Log data: <code></code></h3>
      <pre>${JSON.stringify(this.arrayWithEvents).split(',').join(',\n')}</pre>
    `;
  }
}

// <button @click=${() => (this.providerItem[0].data = 'hallo')}>set "hallo"</button>
