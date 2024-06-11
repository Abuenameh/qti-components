import '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import './item-print-variables';

import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { html } from '@lit-labs/preact-signals';
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
      </div>
      <button @click=${() => item.processResponse()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};
