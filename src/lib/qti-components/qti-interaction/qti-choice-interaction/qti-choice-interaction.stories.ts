import { action } from '@storybook/addon-actions';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

import type { Meta, StoryObj } from '@storybook/web-components';

import '../../index';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-choice-interaction',
  argTypes: {
    'min-choices': { control: { type: 'number' }, table: { category: 'QTI' } },
    'max-choices': { control: { type: 'number' }, table: { category: 'QTI' } },
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
      table: { category: 'QTI' }
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    classes: {
      description: 'supported classes',
      control: 'inline-check',
      options: [
        'qti-choices-stacking-2',
        'qti-choices-stacking-3',
        'qti-choices-stacking-4',
        'qti-choices-stacking-5',
        'qti-orientation-horizontal',
        'qti-input-control-hidden'
      ],
      table: { category: 'QTI' }
    },
    shuffle: { control: { type: 'boolean' } },
    'data-max-selections-message': { description: 'unsupported', table: { category: 'QTI' } },
    'data-min-selections-message': { description: 'unsupported', table: { category: 'QTI' } }
  }
};
export default meta;

export const Interaction = {
  render: args => {
    return html` <qti-choice-interaction
      data-max-selections-message="Too little selections made"
      data-min-selections-message="Too much selections made"
      response-identifier=${args['response-identifier']}
      @qti-register-interaction=${action(`qti-register-interaction`)}
      @qti-interaction-response=${action(`qti-interaction-response`)}
      class=${ifDefined(args.classes ? args.classes.join(' ') : undefined)}
      min-choices=${ifDefined(args['min-choices'])}
      max-choices=${ifDefined(args['max-choices'])}
      orientation=${ifDefined(args.orientation)}
      ?shuffle=${args.shuffle}
      ?readonly=${args.readonly}
      .disabled=${args.disabled}
      >${'\n'}${[
        {text: 'I think you can use WorkFlow.',fixed:false},
        {text: 'Fixed! You should use FlowChart',fixed:true},
        {text: 'No you should use Workload Rage.',fixed:false},
        {text: 'I would recommend Chart Up.',fixed:false}
      ].map(
        (item, index) =>
          html` <qti-simple-choice ?fixed=${item.fixed} data-testid="choice-${index}" identifier="choice-${index}">${item.text}</qti-simple-choice
            >${'\n'}`
      )}</qti-choice-interaction
    >`;
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    //   // 👇 Simulate interactions with the component
    //   // See https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args to learn how to setup logging in the Actions panel
    userEvent.click(canvas.getByTestId('choice-2'));
    // //   // 👇 Assert DOM structure
    expect(canvas.getByTestId('choice-2').getAttribute('aria-checked')).toBeTruthy();
  }
};

export const Simple: Story = {
  render: Interaction.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-input-control-hidden', 'qti-choices-stacking-2']
  }
};

// export const PercentageImplemented = {
//   render: ({ args }, { argTypes }) =>
//     html`<progress id="file" max=${Object.keys(argTypes).length} value="3">70%</progress> ${JSON.stringify(
//         argTypes,
//         null,
//         4
//       )}`
// };
