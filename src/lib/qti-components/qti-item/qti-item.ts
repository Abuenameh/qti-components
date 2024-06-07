import { Signal, SignalWatcher, computed, html, signal } from '@lit-labs/preact-signals';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { OutcomeChangedDetails } from '../internal/event-types';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

@customElement('qti-item')
export class QtiItem extends SignalWatcher(LitElement) {
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  debounceResponseDelay: number = 500;

  public context: Signal<
    {
      identifier: string;
      variables: Signal<{ identifier: string; value: Readonly<string | string[]> }[]>;
    }[]
  > = signal([]);

  constructor() {
    super();
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<Signal>) => {
      const qtiAssessmentItem = e.composedPath().find(el => el instanceof QtiAssessmentItem) as QtiAssessmentItem;
      this.updateContext(qtiAssessmentItem);
    });
  }

  updateContext(qtiAssessmentItem: QtiAssessmentItem) {
    const existing = this.context.value.find(v => v.identifier === qtiAssessmentItem.identifier);

    const variables = computed(() =>
      qtiAssessmentItem.context.value
        .filter(v => v.identifier === 'RESPONSE')
        .map(v => ({ identifier: v.identifier, value: v.value }))
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
      <h1>QTI Item</h1>
      <pre>${computed(() => JSON.stringify(this.context, null, 4))}</pre>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
