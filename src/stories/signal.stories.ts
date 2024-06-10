import '@citolab/qti-components/qti-components';
import type { Meta, StoryObj } from '@storybook/web-components';
import './item-print-variables';

import { QtiAssessmentItem, QtiItem } from '@citolab/qti-components/qti-components';
import { Signal, computed, html, signal } from '@lit-labs/preact-signals';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import packages from '../assets/packages.json';
import { fetchItem } from './fetch-item';

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

const item: QtiAssessmentItem | null = null;
const itemRef: Ref<QtiItem> = createRef();

const context: Signal<
  {
    identifier: string;
    variables: Signal<{ identifier: string; value: Readonly<string | string[]> }[]>;
  }[]
> = signal([]);

const events: Signal = signal([]);

const addOrUpdateContextOfItem = () => {
  const existing = context.value.find(v => v.identifier === itemRef.value.identifier);
  existing && itemRef.value.setVariableValues(existing.variables.peek());

  context.value = [
    ...context.peek().filter(v => v.identifier !== itemRef.value.identifier),
    { identifier: itemRef.value.identifier, variables: itemRef.value.getVariableValuesSignal() }
  ];
};

const addEvent = (type, detail, identifier) =>
  (events.value = [
    ...events.peek(),
    {
      identifier,
      event: {
        type,
        detail
      }
    }
  ]);

export const Signals: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    item && (item.disabled = disabled);

    return html`
      <pre>${computed(() => JSON.stringify(context.value, null, 4))}</pre>

      <qti-item
        ${ref(itemRef)}
        class="item"
        @qti-assessment-item-connected=${e => {
          // item = e.target as QtiAssessmentItem;
          addOrUpdateContextOfItem();
        }}
        @qti-responses-changed=${e => addEvent(e.type, e.detail, e.currentTarget.identifier)}
        @qti-outcomes-changed=${e => addEvent(e.type, e.detail, e.currentTarget.identifier)}
      >
        ${xml.itemXML}
        <item-print-variables></item-print-variables>
      </qti-item>

      <h3>Log data:</h3>
      <pre>${computed(() => JSON.stringify(events.value).split(',').join(',\n'))}</pre>

      <button @click=${() => item.processResponse()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};

// <input
// type="range"
// @input=${e => changeRange(e.target.value)}
// min="0"
// .max=${computed(() => events.value.length)}
// .value=${computed(() => events.value.length - 1)}
// />

// const changeRange = (eventIndex: number) => {
//     const eventsUntilEventIndex = events.peek().slice(0, eventIndex);

//     eventsUntilEventIndex.forEach(event => {
//       itemRef.value.dispatchEvent(new CustomEvent(event.name, { detail: event.payload }));
//     });
//   };
