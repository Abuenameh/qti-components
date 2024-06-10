import '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import './item-print-variables';

import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
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

let item: QtiAssessmentItem | null = null;

export const Default: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    item && (item.disabled = disabled);
    return html`
      <div
        class="item"
        @qti-assessment-item-connected=${e => {
          item = e.target as QtiAssessmentItem;
          action('qti-assessment-item-connected')(e);
        }}
        @qti-interaction-changed=${action('qti-interaction-changed')}
        @qti-outcome-changed=${action('qti-outcome-changed')}
      >
        ${xml.itemXML}
        <item-print-variables></item-print-variables>
      </div>
      <button @click=${() => item.processResponse()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};

export const Wrapper: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    item && (item.disabled = disabled);
    return html`
      <qti-item-logger>
        <qti-item
          class="item"
          @qti-assessment-item-connected=${e => {
            item = e.target as QtiAssessmentItem;
            action('qti-assessment-item-connected')(e);
          }}
          @qti-responses-changed=${action('qti-responses-changed')}
          @qti-outcomes-changed=${action('qti-outcomes-changed')}
        >
          ${xml.itemXML}
          <item-print-variables></item-print-variables>
        </qti-item>
      </qti-item-logger>
      <button @click=${() => item.processResponse()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};

export const Logger: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    item && (item.disabled = disabled);

    const context: Signal<
      {
        identifier: string;
        variables: Signal<{ identifier: string; value: Readonly<string | string[]> }[]>;
      }[]
    > = signal([]);

    const events: Signal = signal([]);

    const changeRange = (eventIndex: number) => {
      const eventsUntilEventIndex = events.peek().slice(0, eventIndex);

      eventsUntilEventIndex.forEach(event => {
        inputRef.value.dispatchEvent(new CustomEvent(event.name, { detail: event.payload }));
      });
    };
    const inputRef: Ref<HTMLInputElement> = createRef();

    const addOrUpdateContextOfItem = (qtiAssessmentItem: QtiAssessmentItem) => {
      const existing = context.value.find(v => v.identifier === qtiAssessmentItem.identifier);

      const variables = computed(() =>
        qtiAssessmentItem.context.value.map(v => ({ identifier: v.identifier, value: v.value }))
      );

      if (existing) {
        qtiAssessmentItem.context.value = qtiAssessmentItem.context.value.map(v => {
          const existingVariable = existing.variables.value.find(e => e.identifier === v.identifier);
          return existingVariable ? { ...v, value: existingVariable.value } : v;
        });
      }

      context.value = [
        ...context.peek().filter(v => v.identifier !== qtiAssessmentItem.identifier),
        { identifier: qtiAssessmentItem.identifier, variables }
      ];
    };

    return html`
      <pre>${computed(() => JSON.stringify(context.value, null, 4))}</pre>

      <slot></slot>

      <qti-item
        ${ref(inputRef)}
        class="item"
        @qti-assessment-item-connected=${e => {
          item = e.target as QtiAssessmentItem;
          addOrUpdateContextOfItem(item);
          action('qti-assessment-item-connected')(e);
        }}
        @qti-responses-changed=${e =>
          (events.value = [...events.peek(), { name: 'qti-responses-changed', payload: e.detail }])}
        @qti-outcomes-changed=${e =>
          (events.value = [...events.peek(), { name: 'qti-outcomes-changed', payload: e.detail }])}
      >
        ${xml.itemXML}
        <item-print-variables></item-print-variables>
      </qti-item>

      <input
        type="range"
        @input=${e => changeRange(e.target.value)}
        min="0"
        max=${events.value.length}
        value=${events.value.length - 1}
      />

      <h3>Log data:</h3>
      <pre>${computed(() => JSON.stringify(events.value).split(',').join(',\n'))}</pre>

      <button @click=${() => item.processResponse()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};
