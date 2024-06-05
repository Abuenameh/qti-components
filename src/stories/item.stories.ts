import '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './item-print-variables';

import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
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

export const Examples: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    item && (item.disabled = disabled);
    return html`
      <!-- <qti-item-logger> -->
      <qti-item
        class="item"
        @qti-assessment-item-connected=${e => {
          item = e.detail;
          action('qti-assessment-item-connected')(e);
        }}
        @qti-response-changed=${action('qti-response-changed')}
        @qti-outcomes-changed=${action('qti-outcomes-changed')}
      >
        ${xml.itemXML} **<item-print-variables></item-print-variables>**
      </qti-item>
      <!-- </qti-item-logger> -->
      <button @click=${() => item.processResponse()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};

export const Controller: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    item && (item.disabled = disabled);
    return html`
      <qti-item-logger
        @qti-assessment-item-connected=${e => {
          item = e.detail;
          action('qti-assessment-item-connected')(e);
        }}
      >
        ${xml.itemXML}
      </qti-item-logger>
      <button @click=${() => item.processResponse()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};

// @qti-interaction-changed=${onInteractionChangedAction}
// @qti-outcome-changed=${onOutcomeChangedAction}
// @qti-assessment-item-connected=${onItemFirstUpdated}
/*
      <div
        class="item"
        @qti-assessment-item-connected=${e => {
          item = e.detail;
          action('qti-assessment-item-connected')(e);
        }}
        @qti-response-changed=${action('qti-response-changed')}
        @qti-outcomes-changed=${action('qti-outcomes-changed')}
      >
        ${unsafeHTML(`
        ${xml.itemXML}
          <item-print-variables></item-print-variables>
        `)}
      </div>
      */
