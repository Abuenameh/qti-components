import { Context, ContextCallback, ContextProvider, ContextType } from '@lit/context';
// import type {Context, ContextType} from '../create-context.js';
import { ContextConsumer } from '@lit/context';
import type { ReactiveController, ReactiveControllerHost } from '@lit/reactive-element';
import { InteractionChangedDetails, OutcomeChangedDetails } from '../internal/event-types';
import { VariableDeclaration } from '../internal/variables';
import { itemContext, itemContextVariables } from './qti-item.context';

export interface Options<C extends Context<unknown, unknown>> {
  context: C;
  callback?: (value: ContextType<C>, dispose?: () => void) => void;
  subscribe?: boolean;
}

export class QtiItemContextConsumer<
  C extends Context<unknown, unknown>,
  HostElement extends ReactiveControllerHost & HTMLElement
> implements ReactiveController
{
  protected host: HostElement;
  private context: C;
  private callback?: (value: ContextType<C>, dispose?: () => void) => void;
  private subscribe = false;

  private provided = false;

  _value?: ContextType<C & { variables: any }> = undefined;
  _provider: ContextProvider<any, Partial<ReactiveControllerHost> & HTMLElement>;
  private _consumer: ContextConsumer<
    {
      __context__: import('/Users/patrickklein/Projects/QTI/QTI-Components/src/lib/qti-components/qti-item/qti-item.context').ItemContext;
    },
    HostElement
  >;

  set value(value: ContextType<C>) {
    this._value = value;
    this._provider.setValue(value);
    this.host.requestUpdate();
  }
  get value(): ContextType<C> {
    return this._value;
  }

  // private _initialContext: Readonly<ItemContext> = { ...this._context, variables: this._context.variables };
  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  debounceResponseDelay: number = 500;

  constructor(host: HostElement, options: Options<C>);
  constructor(
    host: HostElement,
    context: C,
    callback?: (value: ContextType<C>, dispose?: () => void) => void,
    subscribe?: boolean
  );
  constructor(
    host: HostElement,
    contextOrOptions: C | Options<C>,
    callback?: (value: ContextType<C>, dispose?: () => void) => void,
    subscribe?: boolean
  ) {
    this.host = host;
    if ((contextOrOptions as Options<C>).context !== undefined) {
      const options = contextOrOptions as Options<C>;
      this.context = options.context;
      this.callback = options.callback;
      this.subscribe = options.subscribe ?? false;
    } else {
      this.context = contextOrOptions as C;
      this.callback = callback;
      this.subscribe = subscribe ?? false;
    }
    this.host.addController(this);
  }

  private unsubscribe?: () => void;

  hostConnected(): void {
    let contextFound = false;

    this._consumer = new ContextConsumer(this.host, {
      context: itemContext,
      subscribe: true,
      callback: value => {
        contextFound = true;
        this._callback(value as ContextType<C>);
      }
    });

    console.log(this.host.tagName, 'contextFound', contextFound);

    if (!contextFound) {
      this.attachListeners();
      if (this._callback) {
        this._callback({
          identifier: this.host.getAttribute('identifier') ?? '',
          variables: itemContextVariables
        } as ContextType<C>);
      }
      this._provider = new ContextProvider(this.host, { context: itemContext });
      this._provider.setValue({
        identifier: this.host.getAttribute('identifier') ?? '',
        variables: itemContextVariables
      });
    }
  }

  hostDisconnected(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  private _callback: ContextCallback<ContextType<C>> = (value, unsubscribe) => {
    if (this.unsubscribe) {
      if (this.unsubscribe !== unsubscribe) {
        this.provided = false;
        this.unsubscribe();
      }
      if (!this.subscribe) {
        this.unsubscribe();
      }
    }
    this._value = value;
    this.host.requestUpdate();

    if (!this.provided || this.subscribe) {
      this.provided = true;
      if (this.callback) {
        this.callback(value, unsubscribe);
      }
    }

    this.unsubscribe = unsubscribe;
  };

  attachListeners() {
    this.host.addEventListener(
      'qti-register-variable',
      (
        e: CustomEvent<{
          variable: VariableDeclaration<string | string[]>;
        }>
      ) => {
        this.value = { ...this._value, variables: [...this._value.variables, e.detail.variable] };

        // this._initialContext = this._context;
        e.stopPropagation();
      }
    );
    this.host.addEventListener('qti-interaction-changed', (e: CustomEvent<InteractionChangedDetails>) => {
      this.value = {
        ...this._value,
        variables: this._value.variables.map(v =>
          v.identifier === e.detail.responseIdentifier ? { ...v, value: e.detail.response } : v
        )
      };
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

      const outcomeVariable = this.value.variables.find(v => v.identifier === e.detail.outcomeIdentifier);
      if (!outcomeVariable) {
        console.warn(`Can not set qti-outcome-identifier: ${e.detail.outcomeIdentifier}, it is not available`);
        return;
      }

      this.value = {
        ...this._value,
        variables: this._value.variables.map(v => {
          if (v.identifier !== e.detail.outcomeIdentifier) {
            return v;
          }
          return {
            ...v,
            value: outcomeVariable.cardinality === 'single' ? e.detail.value : [...v.value, e.detail.value as string]
          };
        })
      };

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
