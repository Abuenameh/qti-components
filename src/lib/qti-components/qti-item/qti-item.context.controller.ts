import { Signal } from '@lit-labs/preact-signals';
import type { ReactiveController } from '@lit/reactive-element';
import { LitElement, ReactiveControllerHost } from 'lit';
import { InteractionChangedDetails, OutcomeChangedDetails, ResponseChangedDetails } from '../internal/event-types';
import { ItemContext } from './qti-item.context';

export class QtiItemContextConsumer implements ReactiveController {
  protected host: ReactiveControllerHost & LitElement & { context: Signal<ItemContext> };

  private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  private debounceTimeout: NodeJS.Timeout;
  debounceResponseDelay: number = 500;

  constructor(host: ReactiveControllerHost & LitElement & { context }) {
    this.host = host;
    this.host.addController(this);

    this.host.addEventListener('qti-outcomes-changed', (e: CustomEvent<OutcomeChangedDetails[]>) => {
      console.log('qti-outcomes-changed', e.detail);
    });

    this.host.addEventListener(
      'qti-responses-changed',
      (
        e: CustomEvent<{
          responseIdentifier: string;
          response: string;
        }>
      ) => {
        console.log('qti-responses-changed', e.detail);
      }
    );

    this.attachListeners();
  }

  hostConnected() {}

  hostDisconnected() {
    // this.removeListeners();
  }

  attachListeners() {
    this.host.addEventListener('qti-interaction-changed', (e: CustomEvent<InteractionChangedDetails>) => {
      this.host.context.value = this.host.context.value.map(v =>
        v.identifier === e.detail.responseIdentifier ? { ...v, value: e.detail.response } : v
      );
      // this._initialContext = this._context;
      e.stopPropagation();

      // Debounce dispatching of the function
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.host.dispatchEvent(
          new CustomEvent<ResponseChangedDetails[]>('qti-responses-changed', {
            detail: [
              {
                responseIdentifier: e.detail.responseIdentifier,
                value: e.detail.response
              }
            ],
            bubbles: true
          })
        );
      }, this.debounceResponseDelay); // Adjust the debounce delay as needed
    });
    this.host.addEventListener('qti-outcome-changed', (e: CustomEvent<OutcomeChangedDetails>) => {
      this.batchedOutcomeEvents.push(e.detail);

      const outcomeVariable = this.host.context.value.find(v => v.identifier === e.detail.outcomeIdentifier);
      if (!outcomeVariable) {
        console.warn(`Can not set qti-outcome-identifier: ${e.detail.outcomeIdentifier}, it is not available`);
        return;
      }

      this.host.context.value = this.host.context.value.map(v => {
        if (v.identifier !== e.detail.outcomeIdentifier) {
          return v;
        }
        return {
          ...v,
          value: outcomeVariable.cardinality === 'single' ? e.detail.value : [...v.value, e.detail.value as string]
        };
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
