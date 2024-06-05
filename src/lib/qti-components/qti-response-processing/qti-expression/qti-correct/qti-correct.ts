import { ResponseVariable } from '@citolab/qti-components/qti-components';
import { QtiExpression } from '../qti-expression';

export class QtiCorrect extends QtiExpression<string | string[]> {
  get interpretation() {
    return this.getAttribute('interpretation') || '';
  }

  override getResult() {
    const identifier = this.getAttribute('identifier') || '';
    const responseVariable = this.itemContext.value.variables.find(
      v => v.identifier === identifier
    ) as ResponseVariable;
    responseVariable.correctResponse;
    if (responseVariable.cardinality !== 'single') {
      return responseVariable.correctResponse.length > 0 ? responseVariable.correctResponse[0] : '';
    } else {
      return responseVariable.correctResponse;
    }
  }
}

customElements.define('qti-correct', QtiCorrect);
