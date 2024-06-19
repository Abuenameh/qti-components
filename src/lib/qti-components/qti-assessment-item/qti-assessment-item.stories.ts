import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import { action } from '@storybook/addon-actions';
import { QtiAssessmentItem } from './qti-assessment-item';

import { StoryObj } from '@storybook/web-components';
import '../index';

type Story = StoryObj; // <Props>;

export default {
  component: 'qti-assesment-item'
};

const completionStatusTemplate = {
  render: args => {
    const assessmentItemRef = createRef<QtiAssessmentItem>();

    const processResponse = () => {
      assessmentItemRef.value?.processResponse();
    };
    return html`
      <qti-assessment-item
        @qti-outcome-changed="${e => {
          action(e.detail)();
        }}"
        @qti-interaction-changed="${e => {
          // processResponse();
          action(e.detail)();
        }}"
        identifier="blah"
        ${ref(assessmentItemRef)}
      >
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
          <qti-correct-response>
            <qti-value>true</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier">
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" normal-maximum="10.0">
          <qti-default-value>
            <qti-value>0</qti-value>
          </qti-default-value>
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
          <qti-default-value>
            <qti-value>10.0</qti-value>
          </qti-default-value>
        </qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
            <qti-prompt>Sigmund Freud and Carl Jung both belong to the psychoanalytic school of psychology.</qti-prompt>
            <qti-simple-choice identifier="true" fixed="true"
              >True<qti-feedback-inline outcome-identifier="FEEDBACK" identifier="true" show-hide="show"
                >That's correct</qti-feedback-inline
              ></qti-simple-choice
            >
            <qti-simple-choice identifier="false" fixed="true"
              >False<qti-feedback-inline outcome-identifier="FEEDBACK" identifier="false" show-hide="show"
                >That's not correct</qti-feedback-inline
              >
            </qti-simple-choice>
          </qti-choice-interaction>
          <qti-end-attempt-interaction title="end"></qti-end-attempt-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-set-outcome-value identifier="FEEDBACK">
            <qti-variable identifier="RESPONSE"></qti-variable>
          </qti-set-outcome-value>
          <qti-response-condition>
            <qti-response-if>
              <qti-match>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-correct identifier="RESPONSE"></qti-correct>
              </qti-match>
              <qti-set-outcome-value identifier="SCORE">
                <qti-variable identifier="MAXSCORE"></qti-variable>
              </qti-set-outcome-value>
            </qti-response-if>
          </qti-response-condition>
        </qti-response-processing>
      </qti-assessment-item>
    `;
  }
};

export const InlineFeedback: Story = {
  render: completionStatusTemplate.render,
  args: {},
  play: async ({ canvasElement }) => {
    // const canvas = within(canvasElement);
    // const choiceElement = canvas.getByTestId('choice');
    // const isFeedbackVisible = canvas.getByTestId('feedback').shadowRoot.querySelector('slot');
    // await userEvent.click(choiceElement);
    // await new Promise(resolve => setTimeout(resolve, 500));
    // expect(isFeedbackVisible).toHaveClass('on');
    // await userEvent.click(choiceElement);
    // await new Promise(resolve => setTimeout(resolve, 500));
    // expect(isFeedbackVisible).toHaveClass('off');
  }
};
