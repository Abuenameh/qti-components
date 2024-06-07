import { Signal } from '@lit-labs/preact-signals';
import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ItemContext, itemContext } from '../../../qti-item/qti-item.context';

export class QtPrintedVariable extends LitElement {
  @property({ type: String })
  identifier: string;

  @consume({ context: itemContext })
  @state()
  private itemContext?: Signal<ItemContext>;

  override render() {
    const value = this.itemContext?.value.find(v => v.identifier === this.identifier)?.value;
    return html`${JSON.stringify(value, null, 2)}`;
  }

  // constructor() {
  //   super();
  //   const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
  //   assessmentItem.addEventListener('qti-response-processed', () => {
  //     this.value = this.calculate() as string;
  //   });
  // }

  // public connectedCallback(): void {
  //   super.connectedCallback();
  //   this.value = this.calculate() as string;
  // }

  public calculate(): Readonly<string | string[]> {
    // const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    // const identifier = this.identifier;
    const result = this.itemContext?.value.find(v => v.identifier === this.identifier)?.value;
    return result;
  }
}

customElements.define('qti-printed-variable', QtPrintedVariable);
