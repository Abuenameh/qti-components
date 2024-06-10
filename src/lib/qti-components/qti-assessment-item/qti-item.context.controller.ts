import { Signal } from '@lit-labs/preact-signals';
import type { ReactiveController } from '@lit/reactive-element';
import { LitElement, ReactiveControllerHost } from 'lit';
import { ItemContext } from './qti-item.context';

export class QtiItemContextConsumer implements ReactiveController {
  protected host: ReactiveControllerHost & LitElement & { context: Signal<ItemContext> };

  // private batchedOutcomeEvents: OutcomeChangedDetails[] = [];
  // private debounceTimeout: NodeJS.Timeout;
  // debounceResponseDelay: number = 500;

  constructor(host: ReactiveControllerHost & LitElement & { context }) {
    this.host = host;
    this.host.addController(this);

    // this.host.addEventListener('qti-outcomes-changed', (e: CustomEvent<OutcomeChangedDetails[]>) => {
    //   console.log('qti-outcomes-changed', e.detail);
    // });

    // this.host.addEventListener('qti-responses-changed', (e: CustomEvent<ResponseChangedDetails[]>) => {
    //   const updatedContext = this.host.context.value.map(v => {
    //     const matchingDetail = e.detail.find(d => d.responseIdentifier === v.identifier);
    //     if (matchingDetail) {
    //       return { ...v, value: matchingDetail.value };
    //     }
    //     return v;
    //   });
    //   this.host.context.value = updatedContext;
    // });

    this.attachListeners();
  }

  hostConnected() {}

  hostDisconnected() {}

  attachListeners() {}
}
