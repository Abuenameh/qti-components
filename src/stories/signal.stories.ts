import '@citolab/qti-components/qti-components';
import type { Meta, StoryObj } from '@storybook/web-components';
import './item-print-variables';

import { ItemEvent, QtiItem, VariableValues } from '@citolab/qti-components/qti-components';
import { Signal, batch, computed, html, signal } from '@lit-labs/preact-signals';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import packages from '../assets/packages.json';
import { fetchItem } from './fetch-item';

import itemCSS from '../item.css?inline';

const meta: Meta = {
  title: 'Examples',
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    disabled: { control: { type: 'boolean' } },
    itemIndex: { control: { type: 'range', min: 0, max: 30, step: 1 } }
  },
  args: {
    serverLocation: '/api',
    qtipkg: 'examples',
    itemIndex: 0
  },
  parameters: {
    controls: {
      expanded: false
    }
  }
};
export default meta;
type Story = StoryObj;

const context: Signal<
  {
    itemIdentifier: string;
    variables: Signal<VariableValues[]>;
    initial: VariableValues[];
  }[]
> = signal([]);
const events: Signal<
  {
    itemIdentifier: string;
    event: ItemEvent;
  }[]
> = signal([]);

const hasState = () => context.value.find(v => v.itemIdentifier === itemRef.value.itemIdentifier);
const updateState = () => {
  const existing = context.peek().find(v => v.itemIdentifier === itemRef.value.itemIdentifier);
  itemRef.value.variables = existing.variables.peek();

  context.value = context.value.map(v => {
    if (v.itemIdentifier === itemRef.value.itemIdentifier) {
      return {
        ...v,
        variables: itemRef.value.stateSignal
      };
    }
    return v;
  });
};
const createState = () => {
  context.value = [
    ...context.peek(),
    {
      itemIdentifier: itemRef.value.itemIdentifier,
      variables: itemRef.value.stateSignal,
      initial: itemRef.value.stateSignal.peek()
    }
  ];
};

const addEvent = (type, detail, identifier) =>
  (events.value = [
    ...events.peek(),
    {
      itemIdentifier: identifier,
      event: {
        type,
        detail
      }
    }
  ]);

const sheet = new CSSStyleSheet();
sheet.replaceSync(itemCSS);

const maxRange = computed(() => events.value.filter(e => e.itemIdentifier === itemRef.value.itemIdentifier).length);
const currentRange = computed(() => events.value.filter(e => e.itemIdentifier === itemRef.value.itemIdentifier).length);
const changeRange = (eventIndex: number) => {
  const myEvents = events
    .peek()
    .filter(e => e.itemIdentifier === itemRef.value.itemIdentifier)
    .slice(0, eventIndex);
  itemRef.value.variables = context.value.find(v => v.itemIdentifier === itemRef.value.itemIdentifier).initial;
  batch(() => myEvents.forEach(ev => itemRef.value.event(ev.event)));
};

const itemRef: Ref<QtiItem> = createRef();

let a = 0;
context.subscribe(() => {
  console.log('context changed', a++, context);
});

export const Signals: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    itemRef.value && (itemRef.value.disabled = disabled);

    return html`
      <input
        type="range"
        @input=${e => changeRange(e.target.value)}
        min="0"
        max=${maxRange as any}
        value=${currentRange as any}
      />

      <qti-item
        ${ref(itemRef)}
        .stylesheet=${[sheet]}
        class="item"
        @qti-item-connected=${() => (hasState() ? updateState() : createState())}
        @qti-responses-changed=${e => addEvent(e.type, e.detail, e.currentTarget.identifier)}
        @qti-outcomes-changed=${e => addEvent(e.type, e.detail, e.currentTarget.identifier)}
        .item=${xml.itemXML}
      >
      </qti-item>

      <button @click=${() => itemRef.value.process()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};

// <small><pre>${computed(() => JSON.stringify(context.value, null, 4))}</pre></small>
// <small><pre>${computed(() => JSON.stringify(events.value, null, 4))}</pre></small>
