import { Signal, SignalWatcher, computed, html } from '@lit-labs/preact-signals';
import { LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { InteractionChangedDetails, OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

@customElement('qti-item')
export class QtiItem extends SignalWatcher(LitElement) {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, mode: 'open' as any, delegatesFocus: false };
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  private debounceResponseDelay: number = 500;
  private qtiAssessmentItem: QtiAssessmentItem;

  @state()
  public item: DocumentFragment | HTMLElement;

  get identifier() {
    return this.qtiAssessmentItem.identifier;
  }

  getVariableValuesSignal() {
    return computed(() =>
      this.qtiAssessmentItem.context.value.map(v => ({ identifier: v.identifier, value: v.value }))
    );
  }

  setVariableValues(variables: { identifier: string; value: Readonly<string | string[]> }[]) {
    this.qtiAssessmentItem.context.value = this.qtiAssessmentItem.context.peek().map(v => {
      const existingVariable = variables.find(e => e.identifier === v.identifier);
      return existingVariable ? { ...v, value: existingVariable.value } : v;
    });
  }

  processResponse() {
    this.qtiAssessmentItem.processResponse();
  }

  set disabled(value: boolean) {
    this.qtiAssessmentItem.disabled = value;
  }

  get dataset() {
    return this.qtiAssessmentItem.dataset;
  }

  set stylesheet(value: CSSStyleSheet[]) {
    requestAnimationFrame(() => {
      if (this.shadowRoot) this.shadowRoot.adoptedStyleSheets = value;
    });
  }

  constructor() {
    super();
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<Signal>) => {
      e.stopImmediatePropagation();
      // this.#qtiAssessmentItem = e.composedPath().find(el => el instanceof QtiAssessmentItem) as QtiAssessmentItem;
      this.qtiAssessmentItem = this.shadowRoot.firstElementChild as QtiAssessmentItem;

      this.shadowRoot.addEventListener('qti-outcomes-changed', (e: CustomEvent<OutcomeChangedDetails[]>) => {
        const updatedContext = this.qtiAssessmentItem.context.value.map(v => {
          const matchingDetail = e.detail.find(d => d.outcomeIdentifier === v.identifier);
          if (matchingDetail) {
            return { ...v, value: matchingDetail.value };
          }
          return v;
        });
        this.qtiAssessmentItem.context.value = updatedContext;
      });

      this.shadowRoot.addEventListener('qti-responses-changed', (e: CustomEvent<ResponseChangedDetails[]>) => {
        const updatedContext = this.qtiAssessmentItem.context.value.map(v => {
          const matchingDetail = e.detail.find(d => d.responseIdentifier === v.identifier);
          if (matchingDetail) {
            return { ...v, value: matchingDetail.value };
          }
          return v;
        });
        this.qtiAssessmentItem.context.value = updatedContext;
      });

      this.shadowRoot.addEventListener('qti-response-processed', () => {
        this.qtiAssessmentItem.dispatchEvent(
          new CustomEvent<OutcomeChangedDetails[]>('qti-outcomes-changed', {
            detail: this.batchedOutcomeEvents,
            bubbles: true,
            composed: true
          })
        );
        this.batchedOutcomeEvents = [];
      });

      this.shadowRoot.addEventListener('qti-interaction-changed', (e: CustomEvent<InteractionChangedDetails>) => {
        e.stopPropagation();
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
          this.qtiAssessmentItem.dispatchEvent(
            new CustomEvent<ResponseChangedDetails[]>('qti-responses-changed', {
              detail: [
                {
                  responseIdentifier: e.detail.responseIdentifier,
                  value: e.detail.response
                }
              ],
              bubbles: true,
              composed: true
            })
          );
        }, this.debounceResponseDelay); // Adjust the debounce delay as needed
      });

      this.shadowRoot.addEventListener('qti-outcome-changed', (e: CustomEvent<OutcomeChangedDetails>) => {
        this.batchedOutcomeEvents.push(e.detail);

        const outcomeVariable = this.qtiAssessmentItem.context.value.find(
          v => v.identifier === e.detail.outcomeIdentifier
        );

        this.qtiAssessmentItem.context.value = this.qtiAssessmentItem.context.value.map(v => {
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

      this.dispatchEvent(
        new CustomEvent('qti-item-connected', {
          bubbles: true,
          composed: true
        })
      );
    });
  }

  render() {
    return html` ${this.item} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
