import { Signal, SignalWatcher, computed, html } from '@lit-labs/preact-signals';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { InteractionChangedDetails, OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

@customElement('qti-item')
export class QtiItem extends SignalWatcher(LitElement) {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, mode: 'closed' as any, delegatesFocus: false };
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  private debounceResponseDelay: number = 500;
  #qtiAssessmentItem: QtiAssessmentItem;

  get identifier() {
    return this.#qtiAssessmentItem.identifier;
  }

  getVariableValuesSignal() {
    return computed(() =>
      this.#qtiAssessmentItem.context.value.map(v => ({ identifier: v.identifier, value: v.value }))
    );
  }

  setVariableValues(variables: { identifier: string; value: Readonly<string | string[]> }[]) {
    this.#qtiAssessmentItem.context.value = this.#qtiAssessmentItem.context.peek().map(v => {
      const existingVariable = variables.find(e => e.identifier === v.identifier);
      return existingVariable ? { ...v, value: existingVariable.value } : v;
    });
  }

  processResponse() {
    this.#qtiAssessmentItem.processResponse();
  }

  set disabled(value: boolean) {
    this.#qtiAssessmentItem.disabled = value;
  }

  get dataset() {
    return this.#qtiAssessmentItem.dataset;
  }

  constructor() {
    super();
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<Signal>) => {
      this.#qtiAssessmentItem = e.composedPath().find(el => el instanceof QtiAssessmentItem) as QtiAssessmentItem;

      this.addEventListener('qti-outcomes-changed', (e: CustomEvent<OutcomeChangedDetails[]>) => {
        const updatedContext = this.#qtiAssessmentItem.context.value.map(v => {
          const matchingDetail = e.detail.find(d => d.outcomeIdentifier === v.identifier);
          if (matchingDetail) {
            return { ...v, value: matchingDetail.value };
          }
          return v;
        });
        this.#qtiAssessmentItem.context.value = updatedContext;
      });

      this.addEventListener('qti-responses-changed', (e: CustomEvent<ResponseChangedDetails[]>) => {
        const updatedContext = this.#qtiAssessmentItem.context.value.map(v => {
          const matchingDetail = e.detail.find(d => d.responseIdentifier === v.identifier);
          if (matchingDetail) {
            return { ...v, value: matchingDetail.value };
          }
          return v;
        });
        this.#qtiAssessmentItem.context.value = updatedContext;
      });

      this.#qtiAssessmentItem.addEventListener('qti-response-processed', () => {
        this.#qtiAssessmentItem.dispatchEvent(
          new CustomEvent<OutcomeChangedDetails[]>('qti-outcomes-changed', {
            detail: this.batchedOutcomeEvents,
            bubbles: true
          })
        );
        this.batchedOutcomeEvents = [];
      });

      this.#qtiAssessmentItem.addEventListener(
        'qti-interaction-changed',
        (e: CustomEvent<InteractionChangedDetails>) => {
          e.stopPropagation();
          clearTimeout(this.debounceTimeout);
          this.debounceTimeout = setTimeout(() => {
            this.#qtiAssessmentItem.dispatchEvent(
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
        }
      );

      this.#qtiAssessmentItem.addEventListener('qti-outcome-changed', (e: CustomEvent<OutcomeChangedDetails>) => {
        this.batchedOutcomeEvents.push(e.detail);

        const outcomeVariable = this.#qtiAssessmentItem.context.value.find(
          v => v.identifier === e.detail.outcomeIdentifier
        );

        this.#qtiAssessmentItem.context.value = this.#qtiAssessmentItem.context.value.map(v => {
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

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
