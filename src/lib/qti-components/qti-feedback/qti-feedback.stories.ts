import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import { action } from '@storybook/addon-actions';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

import { expect, userEvent, within } from '@storybook/test';
import { StoryObj } from '@storybook/web-components';
import '../index';

type Story = StoryObj; // <Props>;

export default {
  component: 'qti-feedback-inline'
};

const InlineFeedbackRender = {
  render: args => {
    const assessmentItemRef = createRef<QtiAssessmentItem>();

    const processResponse = () => {
      assessmentItemRef.value?.processResponse();
    };
    return html`
      <qti-assessment-item
        @qti-outcome-changed="${e => {
          action(JSON.stringify(e.detail))();
        }}"
        @qti-interaction-changed="${e => {
          processResponse();
          action(JSON.stringify(e.detail))();
        }}"
        identifier="blah"
        ${ref(assessmentItemRef)}
      >
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
          <qti-correct-response>
            <qti-value>true</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <!--￼Define a feedback variable; its baseType is "identifier" so that it can contain the identifier 
        of the feedback message-->
        <qti-outcome-declaration
          identifier="FEEDBACK"
          cardinality="single"
          base-type="identifier"
        ></qti-outcome-declaration>
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
          <!--￼￼￼￼The response variable RESPONSE will hold the candidate's input-->
          <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
            <qti-prompt>Sigmund Freud and Carl Jung both belong to the psychoanalytic school of psychology.</qti-prompt>
            <qti-simple-choice data-testid="choice" identifier="true" fixed="true"
              >True
              <!--￼￼￼The feedbackInline elements are each given the same identifier as the 
                    corresponding option.-->
              <qti-feedback-inline
                data-testid="feedback"
                outcome-identifier="FEEDBACK"
                identifier="true"
                show-hide="show"
                >That's correct</qti-feedback-inline
              ></qti-simple-choice
            >
            <qti-simple-choice identifier="false" fixed="true"
              >False
              <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="false" show-hide="show"
                >That's not correct</qti-feedback-inline
              ></qti-simple-choice
            >
          </qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing>
          <!--￼This time, FEEDBACK is given the value of the identifier of the option which was selected.-->
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
  render: InlineFeedbackRender.render,
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const choiceElement = canvas.getByTestId('choice');
    const isFeedbackVisible = canvas.getByTestId('feedback').shadowRoot.querySelector('slot');

    await userEvent.click(choiceElement);
    expect(isFeedbackVisible).toHaveClass('on');
    await userEvent.click(choiceElement);
    expect(isFeedbackVisible).toHaveClass('off');
  }
};

export const ModalFeedback = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  const processResponse = () => {
    assessmentItemRef.value?.processResponse();
  };

  return html` <qti-assessment-item
    @qti-outcome-changed="${e => {
      action(JSON.stringify(e.detail))();
    }}"
    @qti-interaction-changed="${e => {
      processResponse();
      action(JSON.stringify(e.detail))();
    }}"
    identifier="blah"
    ${ref(assessmentItemRef)}
  >
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>true</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-outcome-declaration
      identifier="FEEDBACK"
      cardinality="single"
      base-type="identifier"
    ></qti-outcome-declaration>
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
        <qti-simple-choice identifier="true" fixed="true">True </qti-simple-choice>
        <qti-simple-choice identifier="false" fixed="true">False </qti-simple-choice>
      </qti-choice-interaction>
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

    <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="true">
      <qti-content-body>correct</qti-content-body>
    </qti-modal-feedback>
    <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="false">
      <qti-content-body>incorrect</qti-content-body>
    </qti-modal-feedback>
  </qti-assessment-item>`;
};

export const DirectFeedback = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  const processResponse = () => {
    assessmentItemRef.value?.processResponse();
  };

  return html`
    <qti-assessment-item
      @qti-outcome-changed="${e => {
        action(JSON.stringify(e.detail))();
      }}"
      @qti-interaction-changed="${e => {
        console.log('qti-interaction-changed: feedback ');
        processResponse();
        action(JSON.stringify(e.detail))();
      }}"
      identifier="blah"
      ${ref(assessmentItemRef)}
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response>
          <qti-value>A</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-item-body>
        <qti-choice-interaction class="qti-input-control-hidden" response-identifier="RESPONSE" max-choices="1">
          <qti-prompt> Wat betekent stuk? </qti-prompt>
          <qti-simple-choice identifier="A">
            Een deel
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="A" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="B" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="C" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="D" show-hide="show"
              >goed</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="B"
            >Een gat
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="B" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="C"
            >Een krant
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="C" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="D">
            Een steen
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="D" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
        </qti-choice-interaction>
      </qti-item-body>

      <qti-response-processing>
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-variable identifier="RESPONSE"></qti-variable>
        </qti-set-outcome-value>

        <!-- <qti-response-condition>
            <qti-response-if>
              <qti-match>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-correct identifier="RESPONSE"></qti-correct>
              </qti-match>
              <qti-set-outcome-value identifier="SCORE">
                <qti-base-value base-type="float">1</qti-base-value>
              </qti-set-outcome-value>
            </qti-response-if>
            <qti-response-else>
              <qti-set-outcome-value identifier="SCORE">
                <qti-base-value base-type="float">0</qti-base-value>
              </qti-set-outcome-value>
            </qti-response-else>
          </qti-response-condition> -->
      </qti-response-processing>
    </qti-assessment-item>
  `;
};

export const AdaptiveFeedback = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  const processResponse = () => {
    assessmentItemRef.value?.processResponse();
  };

  return html`
    <qti-assessment-item
      @qti-outcome-changed="${e => {
        action(JSON.stringify(e.detail))();
      }}"
      @qti-interaction-changed="${e => {
        processResponse();
        action(JSON.stringify(e.detail))();
      }}"
      identifier="kringloop1"
      ${ref(assessmentItemRef)}
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="float">
        <qti-correct-response interpretation="562 kilo">
          <qti-value>562</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-item-body xml:lang="nl-NL">
        <div class="qti-layout-row">
          <div class="qti-layout-col12">
            <p>
              <strong>Hoeveel kilo afval werd er 2021 in Nederland per persoon weggegooid?</strong>
            </p>
            <div>
              <qti-slider-interaction
                response-identifier="RESPONSE"
                lower-bound="0"
                step="100"
                upper-bound="1000"
              ></qti-slider-interaction>
              <qti-feedback-block
                id="feedbackblock-correct-exact"
                identifier="correct-exact"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Helemaal goed! Dat is net zoveel als het gewicht van een groot paard! 🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-correct"
                identifier="correct"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Bijna! We rekenen het goed! 562 kilo 😮 Dat is net zoveel als het gewicht van een groot paard!🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-incorrect-less"
                identifier="incorrect-less"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Helaas het is nog meer! 562 kilo 😮! Dat is net zoveel als het gewicht van een groot paard 🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-incorrect-more"
                identifier="incorrect-more"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Dat is niet goed, gelukkig is het minder, maar toch 562 kilo! Dat is net zoveel als het gewicht van een
                groot paard!🐎
              </qti-feedback-block>
            </div>
          </div>
        </div>
      </qti-item-body>
      <qti-response-processing>
        <qti-response-condition>
          <qti-response-if>
            <qti-and>
              <qti-gte>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-base-value base-type="float">500</qti-base-value>
              </qti-gte>
              <qti-lte>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-base-value base-type="float">600</qti-base-value>
              </qti-lte>
            </qti-and>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">1</qti-base-value>
            </qti-set-outcome-value>
            <qti-response-condition>
              <qti-response-if>
                <qti-equal>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                  <qti-correct identifier="RESPONSE"></qti-correct>
                </qti-equal>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="identifier">correct-exact</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">correct</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
          </qti-response-if>
          <qti-response-else>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">0</qti-base-value>
            </qti-set-outcome-value>
            <qti-response-condition>
              <qti-response-if>
                <qti-lt>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                  <qti-base-value base-type="float">500</qti-base-value>
                </qti-lt>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">incorrect-less</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">incorrect-more</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
          </qti-response-else>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>
  `;
};
