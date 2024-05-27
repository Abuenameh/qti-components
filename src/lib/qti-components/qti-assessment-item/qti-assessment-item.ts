import { createContext } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { watch } from '../../decorators/watch';
import type { InteractionChangedDetails, OutcomeChangedDetails } from '../internal/event-types';
import type { ResponseInteraction } from '../internal/expression-result';
import type { VariableDeclaration, VariableValue } from '../internal/variables';
import { OutcomeVariable, ResponseVariable } from '../internal/variables';
import type { QtiFeedback } from '../qti-feedback/qti-feedback';
import type { Interaction } from '../qti-interaction/internal/interaction/interaction';
import { QtiItemContextConsumer } from '../qti-item';
import { ItemContext } from '../qti-item/qti-item.context';
import type { QtiResponseProcessing } from '../qti-response-processing';

/**
 * @summary The qti-assessment-item element contains all the other QTI 3 item structures.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.dltnnj87l0yj
 * @status stable
 * @since 4.0
 *
 * @dependency qti-feedback
 * @dependency qti-responseprocessing
 *
 * @slot - The default slot where all the other QTI 3 item structures go.
 *
 * @event qti-interaction-changed - Emitted when an interaction is changed.
 * @event qti-outcome-changed - Emitted when an outcome has changed.
 * @event qti-response-processing - Emitted when response-processing is called.
 *
 */
@customElement('qti-assessment-item')
export class QtiAssessmentItem extends LitElement {
  private _feedbackElements: QtiFeedback[] = [];
  private _interactionElements: Interaction[] = [];

  @property({ type: String }) title: string;
  @property({ type: String }) identifier: string = '';
  @property({ type: String }) adaptive: 'true' | 'false' = 'false';
  @property({ type: String }) timeDependent: 'true' | 'false' = 'false';

  @property({ type: Boolean }) disabled: boolean;
  @watch('disabled', { waitUntilFirstUpdate: true })
  _handleDisabledChange = (_: boolean, disabled: boolean) => {
    this._interactionElements.forEach(ch => (ch.disabled = disabled));
  };

  @property({ type: Boolean }) readonly: boolean;
  @watch('readonly', { waitUntilFirstUpdate: true })
  _handleReadonlyChange = (_: boolean, readonly: boolean) =>
    this._interactionElements.forEach(ch => (ch.readonly = readonly));

  private _controller = new QtiItemContextConsumer(this, {
    context: createContext<ItemContext>('item'),
    subscribe: true,
    callback: value => {
      console.log('context', value);
    }
  });

  constructor() {
    super();
    this.addEventListener('qti-register-feedback', (e: CustomEvent<QtiFeedback>) => {
      e.stopPropagation();
      const feedbackElement = e.detail;
      this._feedbackElements.push(feedbackElement);
      feedbackElement.checkShowFeedback(feedbackElement.outcomeIdentifier);
    });
    this.addEventListener('qti-register-interaction', (e: CustomEvent<null>) => {
      e.stopPropagation();
      this._interactionElements.push(e.target as Interaction);
    });
    this.addEventListener('end-attempt', (e: CustomEvent<{ responseIdentifier: string; countAttempt: boolean }>) => {
      const { responseIdentifier, countAttempt } = e.detail;
      this.updateResponseVariable(responseIdentifier, 'true');
      this.processResponse(countAttempt);
    });

    this.addEventListener(
      // wordt aangeroepen vanuit de processingtemplate
      'qti-set-outcome-value',
      (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
        const { outcomeIdentifier, value } = e.detail;
        this.updateOutcomeVariable(outcomeIdentifier, value);
        e.stopPropagation();
      }
    );
    this.addEventListener('qti-interaction-response', this.handleUpdateResponseVariable);
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    await this.updateComplete;
    this._emit<{ detail: QtiAssessmentItem }>('qti-assessment-item-connected', this);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('_context')) {
      console.log(this.tagName, 'update _context');

      const oldContext = changedProperties.get('_context') as ItemContext;
      // if (oldContext == undefined) {
      this._controller.value.variables.forEach(variable => {
        const oldValue = oldContext?.variables?.find(v => v.identifier === variable.identifier)?.value;
        if (variable.type === 'response') {
          const responseVariable = variable as ResponseVariable;
          if (responseVariable.value !== oldValue) {
            const interaction = this._interactionElements.find(
              (el: Interaction) => el.responseIdentifier === responseVariable.identifier
            );
            if (interaction) {
              interaction.response = responseVariable.value;
            }
          }
        }

        if (variable.type === 'outcome') {
          const outcomeVariable = variable as OutcomeVariable;
          if (outcomeVariable.value !== oldValue) {
            this._feedbackElements.forEach(fe => fe.checkShowFeedback(outcomeVariable.identifier));
          }
        }
      });
      // }
    }
  }

  override render() {
    return html`<slot></slot>

      <pre>${JSON.stringify(this._controller.value, null, 4)}</pre> `;
  }

  public get variables(): VariableValue<string | string[] | null>[] {
    return this._controller.value.variables.map(v => ({ identifier: v.identifier, value: v.value, type: v.type }));
  }

  public showCorrectResponse(show: boolean) {
    const responseVariables = this._controller.value.variables.filter(
      (vari: ResponseVariable | OutcomeVariable) => 'correctResponse' in vari && vari.correctResponse
    ) as ResponseVariable[];
    const responses = responseVariables.map(cr => {
      return {
        responseIdentifier: cr.identifier,
        response: cr.correctResponse
      };
    });
    for (const response of responses) {
      const interaction: Interaction | undefined = this._interactionElements.find(
        i => i.getAttribute('response-identifier') === response.responseIdentifier
      );
      interaction && (interaction.correctResponse = show ? response.response : '');
    }
  }

  public processResponse(countNumAttempts: boolean = true): boolean {
    const responseProcessor = this.querySelector('qti-response-processing') as unknown as QtiResponseProcessing;
    if (!responseProcessor) {
      console.info('No responseprocessing');
      return false;
    }

    if (!responseProcessor.process) {
      console.info('Client side response webcomponents not available');
      return false;
    }

    responseProcessor.process();

    if (this.adaptive === 'false') {
      // if adapative, completionStatus is set by the processing template
      this.updateOutcomeVariable('completionStatus', this._getCompletionStatus());
    }

    countNumAttempts &&
      this.updateOutcomeVariable(
        'numAttempts',
        (+this._controller.value.variables.find(v => v.identifier === 'numAttempts')?.value + 1).toString()
      );

    this._emit('qti-response-processed');
    return true;
  }

  public getResponse(identifier: string): Readonly<ResponseVariable> {
    return this.getVariable(identifier) as ResponseVariable;
  }

  public getOutcome(identifier: string): Readonly<OutcomeVariable> {
    return this.getVariable(identifier) as OutcomeVariable;
  }

  public getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>> {
    return this._controller.value.variables.find(v => v.identifier === identifier) || null;
  }

  // saving privates here: ------------------------------------------------------------------------------

  private handleUpdateResponseVariable(event: CustomEvent<ResponseInteraction>) {
    const { responseIdentifier, response } = event.detail;
    this.updateResponseVariable(responseIdentifier, response);
  }

  public updateResponseVariable(identifier: string, value: string | string[] | undefined) {
    this._emit<InteractionChangedDetails>('qti-interaction-changed', {
      item: this.identifier,
      responseIdentifier: identifier,
      response: value
    });

    // if (this.adaptive === 'false') {
    // if adaptive, completionStatus is set by the processing template
    // this.updateOutcomeVariable('completionStatus', this._getCompletionStatus());
    // }
  }

  public updateOutcomeVariable(identifier: string, value: string | string[] | undefined) {
    this._emit<OutcomeChangedDetails>('qti-outcome-changed', {
      item: this.identifier,
      outcomeIdentifier: identifier,
      value: value
    });

    // this._feedbackElements.forEach(fe => fe.checkShowFeedback(identifier));
  }

  private _getCompletionStatus(): 'completed' | 'incomplete' | 'not_attempted' | 'unknown' {
    if (this._interactionElements.every(interactionElement => interactionElement.validate())) return 'completed';
    if (this._interactionElements.some(interactionElement => interactionElement.validate())) return 'incomplete';
    return 'not_attempted';
  }

  private _emit<T>(name, detail = null) {
    this.dispatchEvent(
      new CustomEvent<T>(name, {
        bubbles: true,
        composed: true,
        detail
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item': QtiAssessmentItem;
  }
}
