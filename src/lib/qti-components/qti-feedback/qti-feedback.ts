import { Signal } from '@lit-labs/preact-signals';
import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ItemContext, itemContext } from '../qti-item';

export abstract class QtiFeedback extends LitElement {
  @property({ type: String, attribute: 'show-hide' })
  protected showHide: string;

  @property({ type: String, attribute: 'outcome-identifier' })
  public outcomeIdentifier: string;

  @property({ type: String })
  protected identifier: string;

  @property({ type: String, attribute: false })
  public showStatus: string;

  @consume({ context: itemContext })
  @state()
  private itemContext: Signal<ItemContext>;

  public override connectedCallback() {
    super.connectedCallback();

    this.dispatchEvent(
      new CustomEvent<QtiFeedback>('qti-register-feedback', {
        bubbles: true,
        composed: true,
        detail: this
      })
    );
  }

  public checkShowFeedback(outcomeIdentifier: string) {
    // this.itemContext.subscribe(() => {
    const outcomeVariable = this.itemContext.value.find(v => v.identifier === outcomeIdentifier);

    if (this.outcomeIdentifier !== outcomeIdentifier || !outcomeVariable) return;

    const isFound = Array.isArray(outcomeVariable.value)
      ? outcomeVariable.value.includes(this.identifier)
      : this.identifier !== null && outcomeVariable.value !== null && this.identifier === outcomeVariable.value;

    this.showFeedback(isFound);
    // });
  }

  private showFeedback(value: boolean) {
    this.showStatus = (value && this.showHide === 'show') || (!value && this.showHide === 'hide') ? 'on' : 'off';
  }
}
