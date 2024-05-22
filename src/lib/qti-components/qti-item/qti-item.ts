import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { InteractionChangedDetails, OutcomeChangedDetails } from '../internal/event-types';
import { VariableValue } from '../internal/variables';
import { ItemContext, itemContext, itemContextVariables } from '../qti-assessment-item/qti-assessment-item.context';

@customElement('qti-item')
export class QtiItem extends LitElement {
  @provide({ context: itemContext })
  private _context: ItemContext = {
    identifier: this.getAttribute('identifier'),
    variables: itemContextVariables
  };
  private _initialContext: Readonly<ItemContext> = { ...this._context, variables: this._context.variables };

  constructor() {
    super();

    this.addEventListener('qti-register-variable', e => {
      this._context = { ...this._context, variables: [...this._context.variables, e.detail.variable] };
      this._initialContext = this._context;
      //   e.stopPropagation();
    });
    this.addEventListener('qti-interaction-changed', (e: CustomEvent<InteractionChangedDetails>) => {
      console.log('interaction changed', e.detail.responseIdentifier, e.detail.response);
      this._context = {
        ...this._context,
        variables: this._context.variables.map(v =>
          v.identifier === e.detail.responseIdentifier ? { ...v, value: e.detail.response } : v
        )
      };
      this._initialContext = this._context;
      //   e.stopPropagation();
    });
    this.addEventListener('qti-outcome-changed', (e: CustomEvent<OutcomeChangedDetails>) => {
      console.log('outcome changed', e.detail.outcomeIdentifier, e.detail.value);
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
      // e.stopPropagation();
    });
  }

  public set variables(value: VariableValue<string | string[] | null>[]) {
    if (!Array.isArray(value) || value.some(v => !('identifier' in v))) {
      console.warn('variables property should be an array of VariableDeclaration');
      return;
    }

    this._context = {
      ...this._context,
      variables: this._context.variables.map(variable => {
        const matchingValue = value.find(v => v.identifier === variable.identifier);
        if (matchingValue) {
          return { ...variable, ...matchingValue };
        }
        return variable;
      })
    };
  }

  public resetResponses() {
    this._context = this._initialContext;
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
