import '@citolab/qti-components/qti-components';

import { composeStory } from '@storybook/preview-api';
import { expect } from '@storybook/test';
import { render } from 'lit';

import { fireEvent, screen } from '@testing-library/dom';
import Meta, { InlineFeedback as InlineFeedbackStory } from './qti-assessment-item.stories';
const InlineFeedbackError = composeStory(InlineFeedbackStory, Meta);

test('qti-feedback-test-show', async () => {
  render(InlineFeedbackError(), document.body);

  const choiceElement = screen.getByTestId('choice');

  fireEvent.click(choiceElement);

  const isFeedbackVisible = screen.getByTestId('feedback').getAttribute('show-hide');
  expect(isFeedbackVisible).toBeTruthy();
});
