import { Signal, computed, signal } from '@lit-labs/preact-signals';
import { LitElement, html } from 'lit';
import { customElement, queryAssignedElements, state } from 'lit/decorators.js';
import { OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

@customElement('qti-item-logger')
export class QtiItemLogger extends LitElement {
  @queryAssignedElements({ selector: 'qti-item' }) assignedElements;

  public context: Signal<
    {
      identifier: string;
      variables: Signal<{ identifier: string; value: Readonly<string | string[]> }[]>;
    }[]
  > = signal([]);

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
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<Signal>) => {
      const qtiAssessmentItem = e.composedPath().find(el => el instanceof QtiAssessmentItem) as QtiAssessmentItem;
      this.restoreContext(qtiAssessmentItem);
    });
  }

  changeRange(eventIndex: number) {
    const eventsUntilEventIndex = this.arrayWithEvents.slice(0, eventIndex);

    eventsUntilEventIndex.forEach(event => {
      this.assignedElements[0].dispatchEvent(new CustomEvent(event.name, { detail: event.payload }));
    });
  }

  restoreContext(qtiAssessmentItem: QtiAssessmentItem) {
    const existing = this.context.value.find(v => v.identifier === qtiAssessmentItem.identifier);

    const variables = computed(() =>
      qtiAssessmentItem.context.value.map(v => ({ identifier: v.identifier, value: v.value }))
    );

    if (existing) {
      qtiAssessmentItem.context.value = qtiAssessmentItem.context.value.map(v => {
        const existingVariable = existing.variables.value.find(e => e.identifier === v.identifier);
        return existingVariable ? { ...v, value: existingVariable.value } : v;
      });
    }

    this.context.value = [
      ...this.context.peek().filter(v => v.identifier !== qtiAssessmentItem.identifier),
      { identifier: qtiAssessmentItem.identifier, variables }
    ];
  }

  render() {
    return html`
      <pre>${computed(() => JSON.stringify(this.context, null, 4))}</pre>

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
