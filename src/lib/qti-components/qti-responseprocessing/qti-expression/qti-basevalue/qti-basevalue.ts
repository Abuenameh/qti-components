import { property } from 'lit/decorators.js';
import { BaseType } from '../../../qti-utilities/ExpressionResult';
import { QtiExpression } from '../qti-expression';
export class QtiBaseValue extends QtiExpression<string> {
  @property({ type: String }) baseType: BaseType = 'string';

  public override calculate(): string {
    const value = this.textContent;
    return value;
  }
}

customElements.define('qti-base-value', QtiBaseValue);
