import { LitElement, html } from 'lit';
import { customElement, queryAssignedElements, state } from 'lit/decorators.js';
import { OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';
import { QtiItem } from './qti-item';

@customElement('qti-item-logger')
export class QtiItemLogger extends LitElement {
  @queryAssignedElements({ flatten: true, selector: 'qti-item' })
  providerItem: Array<QtiItem>;

  @state()
  arrayWithEvents = [];
  assessmentItem: QtiAssessmentItem;

  constructor() {
    super();
    this.addEventListener('qti-responses-changed', (event: CustomEvent<ResponseChangedDetails[]>) => {
      this.arrayWithEvents = [...this.arrayWithEvents, { name: 'qti-responses-changed', payload: event.detail }];
    });
    this.addEventListener('qti-outcomes-changed', (event: CustomEvent<OutcomeChangedDetails[]>) => {
      this.arrayWithEvents = [...this.arrayWithEvents, { name: 'qti-outcomes-changed', payload: event.detail }];
    });
    this.addEventListener('qti-assessment-item-connected', (event: CustomEvent) => {
      this.assessmentItem = event.target as QtiAssessmentItem;
    });
  }

  changeRange(eventIndex: number) {
    const eventsUntilEventIndex = this.arrayWithEvents.slice(0, eventIndex);

    eventsUntilEventIndex.forEach(event => {
      this.assessmentItem.dispatchEvent(new CustomEvent(event.name, { detail: event.payload }));
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
