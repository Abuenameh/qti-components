import { Signal } from '@lit-labs/preact-signals';
import { consume } from '@lit/context';
import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseType, Cardinality } from '../../internal/expression-result';
import { ResponseVariable } from '../../internal/variables';
import { ItemContext, itemContext } from '../../qti-item/qti-item.context';
import { QtiMapping } from '../../qti-response-processing/qti-expression/qti-mapping/qti-mapping';
import { QtiVariableDeclaration } from '../qti-variable-declaration';

@customElement('qti-response-declaration')
export class QtiResponseDeclaration extends QtiVariableDeclaration {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType;

  @property({ type: String }) identifier: string;

  @property({ type: String }) cardinality: Cardinality;

  @consume({ context: itemContext })
  @state()
  private itemContext?: Signal<ItemContext>;

  static styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  override render() {
    const value = this.itemContext?.value.find(v => v.identifier === this.identifier)?.value;
    return html`${JSON.stringify(value, null, 2)}`;
  }

  public override connectedCallback() {
    super.connectedCallback();

    const responseVariable: ResponseVariable = {
      baseType: this.baseType,
      identifier: this.identifier,
      correctResponse: this.correctResponse,
      cardinality: this.cardinality || 'single',
      mapping: this.mapping,
      value: null,
      type: 'response',
      candidateResponse: null
    };
    responseVariable.value = this.defaultValues(responseVariable);

    this.itemContext.value = [...this.itemContext.value, responseVariable];
  }

  private get correctResponse(): string | string[] {
    let result: string | string[];
    const correctResponse = this.querySelector('qti-correct-response');
    if (correctResponse) {
      const values = correctResponse.querySelectorAll('qti-value');
      if (this.cardinality === 'single' && values.length > 0) {
        result = values[0].textContent;
        values[0].remove();
      } else if (this.cardinality !== 'single') {
        result = [];
        for (let i = 0; i < values.length; i++) {
          result.push(values[i].textContent);
          values[i].remove();
        }
      }
    }
    return result;
  }

  private get mapping() {
    return this.querySelector('qti-mapping') as QtiMapping;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-declaration': QtiResponseDeclaration;
  }
}
