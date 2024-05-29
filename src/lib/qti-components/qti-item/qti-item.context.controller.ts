import { Context, ContextProvider } from '@lit/context';
import type { ReactiveController, ReactiveControllerHost } from '@lit/reactive-element';
import { InteractionChangedDetails, OutcomeChangedDetails } from '../internal/event-types';
import { VariableDeclaration } from '../internal/variables';
import { ItemContext, itemContext, itemContextVariables } from './qti-item.context';

export interface Options<C extends Context<unknown, unknown>> {
  callback?: (value: ItemContext, oldValue: ItemContext, dispose?: () => void) => void;
}

export class QtiItemContextConsumer<
  C extends Context<unknown, unknown>,
  HostElement extends ReactiveControllerHost & HTMLElement
> implements ReactiveController
{
  protected host: HostElement;

  private callback?: (value: ItemContext, oldValue: ItemContext, dispose?: () => void) => void;

  public get value(): ItemContext {
    return this._provider.value as ItemContext;
  }

  private _provider: ContextProvider<{ __context__: ItemContext }, HostElement>;
  // private _consumer: ContextConsumer<{ __context__: ItemContext }, HostElement>;

  updateValue(newValue: ItemContext) {
    const oldValue = this._provider.value as ItemContext;
    this._provider.setValue(newValue);
    this.callback(newValue, oldValue, this.unsubscribe);
    this.host.requestUpdate();
  }

  // private _initialContext: Readonly<ItemContext> = { ...this._context, variables: this._context.variables };
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  debounceResponseDelay: number = 500;

  constructor(host: HostElement, options: Options<C>) {
    this.host = host;

    this.callback = options.callback;

    this.host.addController(this);
    this.attachListeners();
  }

  private unsubscribe?: () => void;

  hostConnected(): void {
    // let contextFound = false;

    // this._consumer = new ContextConsumer(this.host, {
    //   context: itemContext,
    //   subscribe: true,
    //   callback: value => {
    //     contextFound = true;
    //     this.updateValue(value as ItemContext);
    //   }
    // });

    // if (!contextFound) {

    this._provider = new ContextProvider(this.host, {
      context: itemContext,
      initialValue: {
        identifier: this.host.getAttribute('identifier') ?? '',
        variables: itemContextVariables
      }
    }) as ContextProvider<{ __context__: ItemContext }, HostElement>;
    // }
  }

  hostDisconnected(): void {}

  attachListeners() {
    this.host.addEventListener(
      'qti-register-variable',
      (
        e: CustomEvent<{
          variable: VariableDeclaration<string | string[]>;
        }>
      ) => {
        const context = this._provider.value as ItemContext;
        this.updateValue({
          ...context,
          variables: [...context.variables, e.detail.variable]
        });

        // this._initialContext = this._context;
        e.stopPropagation();
      }
    );
    this.host.addEventListener('qti-interaction-changed', (e: CustomEvent<InteractionChangedDetails>) => {
      console.log('qti-interaction-changed: controller ');

      this.updateValue({
        ...(this._provider.value as ItemContext),
        variables: this._provider.value.variables.map(v =>
          v.identifier === e.detail.responseIdentifier ? { ...v, value: e.detail.response } : v
        )
      });
      // this._initialContext = this._context;
      e.stopPropagation();

      // Debounce dispatching of the function
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.host.dispatchEvent(
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
    this.host.addEventListener('qti-outcome-changed', (e: CustomEvent<OutcomeChangedDetails>) => {
      this.batchedOutcomeEvents.push(e.detail);

      const outcomeVariable = this._provider.value.variables.find(v => v.identifier === e.detail.outcomeIdentifier);
      if (!outcomeVariable) {
        console.warn(`Can not set qti-outcome-identifier: ${e.detail.outcomeIdentifier}, it is not available`);
        return;
      }

      this.updateValue({
        ...this._provider.value,
        variables: this._provider.value.variables.map(v => {
          if (v.identifier !== e.detail.outcomeIdentifier) {
            return v;
          }
          return {
            ...v,
            value: outcomeVariable.cardinality === 'single' ? e.detail.value : [...v.value, e.detail.value as string]
          };
        })
      });

      e.stopPropagation();
    });
    this.host.addEventListener('qti-response-processed', () => {
      this.host.dispatchEvent(
        new CustomEvent('qti-outcomes-changed', {
          detail: this.batchedOutcomeEvents,
          bubbles: true
        })
      );
      this.batchedOutcomeEvents = [];
    });
  }
}
