import { Signal, SignalWatcher, batch, computed, html } from '@lit-labs/preact-signals';
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
      this.qtiAssessmentItem = this.shadowRoot.firstElementChild as QtiAssessmentItem;

      this.dispatchEvent(
        new CustomEvent('qti-item-connected', {
          bubbles: true,
          composed: true
        })
      );
    });
  }

  private handleOutcomesChanged(e: CustomEvent<OutcomeChangedDetails[]>) {
    this.updateContextValues('qti-outcomes-changed', e.detail);
  }

  private handleResponsesChanged(e: CustomEvent<ResponseChangedDetails[]>) {
    this.updateContextValues('qti-responses-changed', e.detail);
  }

  public updateContextValues(
    type: 'qti-outcomes-changed' | 'qti-responses-changed',
    variableMap: OutcomeChangedDetails[] | ResponseChangedDetails[]
  ) {
    const mappie = variableMap.map(d => ({
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

    const outcomeVariable = this.qtiAssessmentItem.context.value.find(v => v.identifier === e.detail.outcomeIdentifier);

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
  }

  handleOutcomesChangedBinded = this.handleOutcomesChanged.bind(this);
  handleResponsesChangedBinded = this.handleResponsesChanged.bind(this);
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('qti-outcomes-changed', this.handleOutcomesChangedBinded);
    this.addEventListener('qti-responses-changed', this.handleResponsesChangedBinded);
    this.shadowRoot.addEventListener('qti-outcome-changed', this.handleOutcomeChanged.bind(this));
    this.shadowRoot.addEventListener('qti-response-processed', this.handleResponseProcessed.bind(this));
    this.shadowRoot.addEventListener('qti-interaction-changed', this.handleInteractionChanged.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('qti-outcomes-changed', this.handleOutcomesChangedBinded);
    this.removeEventListener('qti-responses-changed', this.handleResponsesChangedBinded);
    this.shadowRoot.removeEventListener('qti-outcome-changed', this.handleOutcomeChanged.bind(this));
    this.shadowRoot.removeEventListener('qti-response-processed', this.handleResponseProcessed.bind(this));
    this.shadowRoot.removeEventListener('qti-interaction-changed', this.handleInteractionChanged.bind(this));
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
