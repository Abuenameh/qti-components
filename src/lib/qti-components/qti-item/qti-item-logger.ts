import { LitElement, html } from 'lit';
import { customElement, queryAssignedElements, state } from 'lit/decorators.js';
import { OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';

@customElement('qti-item-logger')
export class QtiItemLogger extends LitElement {
  @queryAssignedElements({ selector: 'qti-item' }) assignedElements;

  @state()
  arrayWithEvents = [];

  constructor() {
    super();
    this.addEventListener('qti-responses-changed', (event: CustomEvent<ResponseChangedDetails[]>) => {
      this.arrayWithEvents = [...this.arrayWithEvents, { name: 'qti-responses-changed', payload: event.detail }];
    });
    this.addEventListener('qti-outcomes-changed', (event: CustomEvent<OutcomeChangedDetails[]>) => {
      this.arrayWithEvents = [...this.arrayWithEvents, { name: 'qti-outcomes-changed', payload: event.detail }];
    });
  }

  changeRange(eventIndex: number) {
    const eventsUntilEventIndex = this.arrayWithEvents.slice(0, eventIndex);

    eventsUntilEventIndex.forEach(event => {
      this.assignedElements[0].dispatchEvent(new CustomEvent(event.name, { detail: event.payload }));
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
        value=${this.arrayWithEvents.length - 1}
      />

      <h3>Log data:</h3>
      <pre>${JSON.stringify(this.arrayWithEvents).split(',').join(',\n')}</pre>
    `;
  }
}
