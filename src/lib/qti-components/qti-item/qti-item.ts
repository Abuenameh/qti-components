import { Signal, SignalWatcher, html } from '@lit-labs/preact-signals';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { InteractionChangedDetails, OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

@customElement('qti-item')
export class QtiItem extends SignalWatcher(LitElement) {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, mode: 'closed' as any, delegatesFocus: false };
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  debounceResponseDelay: number = 500;

  constructor() {
    super();
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<Signal>) => {
      const qtiAssessmentItem = e.composedPath().find(el => el instanceof QtiAssessmentItem) as QtiAssessmentItem;

      this.addEventListener('qti-outcomes-changed', (e: CustomEvent<OutcomeChangedDetails[]>) => {
        const updatedContext = qtiAssessmentItem.context.value.map(v => {
          const matchingDetail = e.detail.find(d => d.outcomeIdentifier === v.identifier);
          if (matchingDetail) {
            return { ...v, value: matchingDetail.value };
          }
          return v;
        });
        qtiAssessmentItem.context.value = updatedContext;
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
          new CustomEvent<OutcomeChangedDetails[]>('qti-outcomes-changed', {
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
    });
  }

  render() {
    return html` <slot></slot> `;
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
