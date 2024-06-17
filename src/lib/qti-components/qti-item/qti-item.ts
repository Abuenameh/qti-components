import { Signal, SignalWatcher, batch, computed, html } from '@lit-labs/preact-signals';
import { LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { InteractionChangedDetails, OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

export type VariableValues = { identifier: string; value: Readonly<string | string[]> };
export type ItemEvent = {
  type: 'qti-outcomes-changed' | 'qti-responses-changed';
  detail: OutcomeChangedDetails[] | ResponseChangedDetails[];
};
@customElement('qti-item')
export class QtiItem extends SignalWatcher(LitElement) {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, mode: 'open' as any, delegatesFocus: false };
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  private debounceResponseDelay: number = 500;
  private qtiAssessmentItem: QtiAssessmentItem;

  @state()
  public item: DocumentFragment | HTMLElement;

  get itemIdentifier() {
    return this.qtiAssessmentItem.identifier;
  }

  // get itemSignal(): Signal<ItemContext> {
  //   console.warn('itemSignal is not recommended if you dont know what you are doing,\n Use stateSignal instead.');
  //   return this.qtiAssessmentItem.context;
  // }

  get stateSignal(): Signal<VariableValues[]> {
    return computed(() =>
      this.qtiAssessmentItem.context.value.map(v => ({ identifier: v.identifier, value: v.value }))
    );
  }

  // get state(): ItemState[] {
  //   return this.qtiAssessmentItem.context.peek().map(v => ({ identifier: v.identifier, value: v.value }));
  // }

  set variables(variables: VariableValues[]) {
    this.qtiAssessmentItem.context.value = this.qtiAssessmentItem.context.peek().map(v => {
      const existingVariable = variables.find(e => e.identifier === v.identifier);
      return existingVariable ? { ...v, value: existingVariable.value } : v;
    });
  }

  set disabled(value: boolean) {
    this.qtiAssessmentItem.disabled = value;
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
      this.qtiAssessmentItem = this.shadowRoot.firstElementChild as QtiAssessmentItem;

      this.dispatchEvent(
        new CustomEvent('qti-item-connected', {
          bubbles: true,
          composed: true
        })
      );
    });
  }

  process(): boolean {
    return this.qtiAssessmentItem.processResponse();
  }

  event({ type, detail }: ItemEvent) {
    const mappie = detail.map(d => ({
      variableIdentifier: type == 'qti-outcomes-changed' ? d.outcomeIdentifier : d.responseIdentifier,
      value: d.value
    }));

    let updatedContext;
    batch(() => {
      updatedContext = this.qtiAssessmentItem.context.value.map(v => {
        const matchingDetail = mappie.find(d => d.variableIdentifier === v.identifier);
        if (matchingDetail) {
          return { ...v, value: matchingDetail.value };
        }
        return v;
      });
    });
    this.qtiAssessmentItem.context.value = updatedContext;
  }

  private handleOutcomesChanged(e: CustomEvent<OutcomeChangedDetails[]>) {
    // this.event({ type: 'qti-outcomes-changed', detail: e.detail });
  }

  private handleResponsesChanged(e: CustomEvent<ResponseChangedDetails[]>) {
    // this.event({ type: 'qti-responses-changed', detail: e.detail });
  }

  private handleResponseProcessed() {
    this.qtiAssessmentItem.dispatchEvent(
      new CustomEvent<OutcomeChangedDetails[]>('qti-outcomes-changed', {
        detail: this.batchedOutcomeEvents,
        bubbles: true,
        composed: true
      })
    );
    this.batchedOutcomeEvents = [];
  }

  private handleInteractionChanged(e: CustomEvent<InteractionChangedDetails>) {
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
  }

  private handleOutcomeChanged(e: CustomEvent<OutcomeChangedDetails>) {
    this.batchedOutcomeEvents.push(e.detail);

    e.stopPropagation();
  }

  private handleOutcomesChangedBinded = this.handleOutcomesChanged.bind(this);
  private handleResponsesChangedBinded = this.handleResponsesChanged.bind(this);
  private handleOutcomeChangedBinded = this.handleOutcomeChanged.bind(this);
  private handleResponseProcessedBinded = this.handleResponseProcessed.bind(this);
  private handleInteractionChangedBinded = this.handleInteractionChanged.bind(this);

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('qti-outcomes-changed', this.handleOutcomesChangedBinded);
    this.addEventListener('qti-responses-changed', this.handleResponsesChangedBinded);
    this.shadowRoot.addEventListener('qti-outcome-changed', this.handleOutcomeChangedBinded);
    this.shadowRoot.addEventListener('qti-response-processed', this.handleResponseProcessedBinded);
    this.shadowRoot.addEventListener('qti-interaction-changed', this.handleInteractionChangedBinded);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('qti-outcomes-changed', this.handleOutcomesChangedBinded);
    this.removeEventListener('qti-responses-changed', this.handleResponsesChangedBinded);
    this.shadowRoot.removeEventListener('qti-outcome-changed', this.handleOutcomeChangedBinded);
    this.shadowRoot.removeEventListener('qti-response-processed', this.handleResponseProcessedBinded);
    this.shadowRoot.removeEventListener('qti-interaction-changed', this.handleInteractionChangedBinded);
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
