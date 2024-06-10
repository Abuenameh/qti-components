import { Signal, SignalWatcher, computed, html, signal } from '@lit-labs/preact-signals';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { InteractionChangedDetails, OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

type ShadowRootMode = 'closed' | 'open';

@customElement('qti-item')
export class QtiItem extends SignalWatcher(LitElement) {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, mode: 'closed' as any, delegatesFocus: false };
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  debounceResponseDelay: number = 500;
  // public item: DocumentFragment | HTMLElement;

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

      this.addEventListener('qti-outcomes-changed', (e: CustomEvent<OutcomeChangedDetails[]>) => {
        console.log('qti-outcomes-changed', e.detail);
      });

      this.addEventListener('qti-responses-changed', (e: CustomEvent<ResponseChangedDetails[]>) => {
        const updatedContext = qtiAssessmentItem.context.value.map(v => {
          const matchingDetail = e.detail.find(d => d.responseIdentifier === v.identifier);
          if (matchingDetail) {
            return { ...v, value: matchingDetail.value };
          }
          return v;
        });
        qtiAssessmentItem.context.value = updatedContext;
      });

      qtiAssessmentItem.addEventListener('qti-response-processed', () => {
        qtiAssessmentItem.dispatchEvent(
          new CustomEvent('qti-outcomes-changed', {
            detail: this.batchedOutcomeEvents,
            bubbles: true
          })
        );
        this.batchedOutcomeEvents = [];
      });

      qtiAssessmentItem.addEventListener('qti-interaction-changed', (e: CustomEvent<InteractionChangedDetails>) => {
        e.stopPropagation();
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
          qtiAssessmentItem.dispatchEvent(
            new CustomEvent<ResponseChangedDetails[]>('qti-responses-changed', {
              detail: [
                {
                  responseIdentifier: e.detail.responseIdentifier,
                  value: e.detail.response
                }
              ],
              bubbles: true
            })
          );
        }, this.debounceResponseDelay); // Adjust the debounce delay as needed
      });

      qtiAssessmentItem.addEventListener('qti-outcome-changed', (e: CustomEvent<OutcomeChangedDetails>) => {
        this.batchedOutcomeEvents.push(e.detail);

        const outcomeVariable = qtiAssessmentItem.context.value.find(v => v.identifier === e.detail.outcomeIdentifier);

        qtiAssessmentItem.context.value = qtiAssessmentItem.context.value.map(v => {
          if (v.identifier !== e.detail.outcomeIdentifier) {
            return v;
          }
          return {
            ...v,
            value: outcomeVariable.cardinality === 'single' ? e.detail.value : [...v.value, e.detail.value as string]
          };
        });

        e.stopPropagation();
      });

      this.updateContext(qtiAssessmentItem);
    });
  }

  updateContext(qtiAssessmentItem: QtiAssessmentItem) {
    const existing = this.context.value.find(v => v.identifier === qtiAssessmentItem.identifier);

    const variables = computed(() =>
      qtiAssessmentItem.context.value
        // .filter(v => v.identifier === 'RESPONSE')
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
      <pre>${computed(() => JSON.stringify(this.context, null, 4))}</pre>
      <slot></slot>
    `;
  }
}

// <h1>QTI Item</h1>
//
// ${this.item}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
