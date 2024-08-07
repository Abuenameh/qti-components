import { ResponseVariable, VariableDeclaration } from '../../../internal/variables';
import { QtiExpression } from '../qti-expression';
export class QtiMultiple extends QtiExpression<ResponseVariable[]> {
  public override getResult(): ResponseVariable[] {
    const variables = this.getVariables() as ResponseVariable[];
    if (variables.length === 0) {
      console.error('unexpected number of children in qti multiple');
      return null;
    }
    for (const variable of variables) {
      if (variable.cardinality !== 'multiple' && variable.cardinality !== 'single') {
        console.error('unexpected cardinality in qti multiple');
        return [];
      }
    }

    // const values = variables.map(v => v.value);
    // console.log(variables);
    // const flattenedArray = values.reduce((acc: string[], value: string | string[]) => {
    //   return acc.concat(Array.isArray(value) ? [...value] : value);
    // }, []);
    // return flattenedArray;

    return variables;
  }
}

customElements.define('qti-multiple', QtiMultiple);
