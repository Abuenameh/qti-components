import { html, LitElement } from 'lit';
import { QtiRule } from '../qti-rule/qti-rule';

export class QtiResponseElse extends LitElement {
  static override get properties() { 
    return { 
      debugCalculateResult: {type: Object},
    };
  }

  override render() {
    return html` <slot></slot>`;
  }

  public calculate() {
    const result = true;
    return true;
  }

  public getSubRules(): QtiRule[] {
    return [...this.children] as QtiRule[];
  }

  public process() {
    const subRules = this.getSubRules();
    for (let i = 0; i < subRules.length; i++) {
      const subRule = subRules[i];
      subRule.process();
    }
  }
}

customElements.define('qti-response-else', QtiResponseElse);
