import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { InteractionChangedDetails, OutcomeChangedDetails } from '../internal/event-types';
import { VariableDeclaration } from '../internal/variables';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';
import { ItemContext, itemContext, itemContextVariables } from './qti-item.context';

@customElement('qti-item')
export class QtiItem extends LitElement {
  @provide({ context: itemContext })
  @state()
  private _context: ItemContext = {
    identifier: this.getAttribute('identifier'),
    variables: itemContextVariables
  };
  private _initialContext: Readonly<ItemContext> = { ...this._context, variables: this._context.variables };
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  qtiAssessmentItem: QtiAssessmentItem;

  set data(value: string) {
    console.log('data', value);
  }

  @property({ type: Number, attribute: 'debounce-response-delay' })
  debounceResponseDelay: number = 500;

  constructor() {
    super();

    this.addEventListener(
      'qti-register-variable',
      (
        e: CustomEvent<{
          variable: VariableDeclaration<string | string[]>;
        }>
      ) => {
        this._context = { ...this._context, variables: [...this._context.variables, e.detail.variable] };
        this._initialContext = this._context;
        e.stopPropagation();
      }
    );
    this.addEventListener('qti-interaction-changed', (e: CustomEvent<InteractionChangedDetails>) => {
      this._context = {
        ...this._context,
        variables: this._context.variables.map(v =>
          v.identifier === e.detail.responseIdentifier ? { ...v, value: e.detail.response } : v
        )
      };
      this._initialContext = this._context;
      e.stopPropagation();

      // Debounce dispatching of the function
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.dispatchEvent(
          new CustomEvent('qti-response-changed', {
            detail: {
              responseIdentifier: e.detail.responseIdentifier,
              response: e.detail.response
            },
            bubbles: true
          })
        );
      }, this.debounceResponseDelay); // Adjust the debounce delay as needed
    });
    this.addEventListener('qti-outcome-changed', (e: CustomEvent<OutcomeChangedDetails>) => {
      this.batchedOutcomeEvents.push(e.detail);

      const outcomeVariable = this._context.variables.find(v => v.identifier === e.detail.outcomeIdentifier);
      if (!outcomeVariable) {
        console.warn(`Can not set qti-outcome-identifier: ${e.detail.outcomeIdentifier}, it is not available`);
        return;
      }

      this._context = {
        ...this._context,
        variables: this._context.variables.map(v => {
          if (v.identifier !== e.detail.outcomeIdentifier) {
            return v;
          }
          return {
            ...v,
            value: outcomeVariable.cardinality === 'single' ? e.detail.value : [...v.value, e.detail.value as string]
          };
        })
      };
      e.stopPropagation();
    });
    this.addEventListener('qti-response-processed', () => {
      this.dispatchEvent(
        new CustomEvent('qti-outcomes-changed', {
          detail: this.batchedOutcomeEvents,
          bubbles: true
        })
      );
      this.batchedOutcomeEvents = [];
    });
  }

  // public set variables(value: VariableValue<string | string[] | null>[]) {
  //   if (!Array.isArray(value) || value.some(v => !('identifier' in v))) {
  //     console.warn('variables property should be an array of VariableDeclaration');
  //     return;
  //   }

  //   this._context = {
  //     ...this._context,
  //     variables: this._context.variables.map(variable => {
  //       const matchingValue = value.find(v => v.identifier === variable.identifier);
  //       if (matchingValue) {
  //         return { ...variable, ...matchingValue };
  //       }
  //       return variable;
  //     })
  //   };
  // }

  public resetResponses() {
    this._context = this._initialContext;
  }

  render() {
    return html`<slot @slotchange=${e => console.log(e)}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}

// @slotchange=${e => {
//   console.log(this.firstElementChild);
//   this._context = {
//     href: this.getAttribute('href'),
//     identifier: this.getAttribute('identifier'),
//     variables: itemContextVariables
//   };
// }}
