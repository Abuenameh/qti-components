import '../../../index';
import { QtiCorrect } from './qti-correct';
import { html, render } from 'lit';
import { describe, expect, it } from '@jest/globals';
describe('qti-correct', () => {
  it('should return value in the correct baseType(float)', () => {
    const correctValue = 'A';

    const template = ({ correctValue }) => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="TEI1" cardinality="single" base-type="string">
          <qti-correct-response>
            <qti-value>${correctValue}</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-correct identifier="TEI1"></qti-correct>
      </qti-assessment-item>
    `;
    render(template({ correctValue: correctValue }), document.body);

    const qtiCorrect = document.body.querySelector('qti-correct') as QtiCorrect;

    expect(qtiCorrect.calculate()).toMatch(correctValue);
  });
});