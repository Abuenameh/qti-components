import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { useEffect, useRef, virtual, useState } from 'haunted';

import '../qti-components/index';
import './index';

import packages from '../../assets/api/packages.json';

// import { QtiAssessmentItemRef } from './index';
import { QtiAssessmentTest } from './qti-assessment-test';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

export default {
  title: 'qti-test',
  argTypes: {
    view: {
      options: ['candidate', 'scorer'],
      control: { type: 'radio' }
    },
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    'navigation-mode': {
      control: { type: 'radio' },
      options: ['linear', 'nonlinear']
    },
    'submission-mode': {
      control: { type: 'radio' },
      options: ['individual', 'simultaneous']
    }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: 'biologie'
  },
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      values: [{ name: 'gray', value: '#eeeeee', default: true }]
    }
  },
  decorators: [story => html`${virtual(story)()}`]
};

export const QtiAssessmentTestStory = {
  render: (args, { argTypes, loaded: { loadeditems } }) => {
    const assessmentTestEl = createRef<QtiAssessmentTest>();

    function requestItem(identifier: { old: string; new: string }) {
      const fetchXml = async () => {
        // debugger;
        if (identifier.old) {
          const oldItemRefEl = assessmentTestEl.value.itemRefEls.get(identifier.old);
          oldItemRefEl.xml = '';
        }
        const itemRefEl = assessmentTestEl.value.itemRefEls.get(identifier.new);
        const xmlFetch = await fetch(`${args.serverLocation}/${args.qtipkg}/depitems/${itemRefEl.href}`); // , { signal });
        const xmlText = await xmlFetch.text();
        itemRefEl.xml = xmlText;
      };
      fetchXml();
    }

    useEffect(() => {
      console.log('Erbuiten', assessmentTestEl.value.signalContext.value);
    }, [assessmentTestEl]);

    return html`
      <button @click=${() => localStorage.setItem('context', JSON.stringify(assessmentTestEl.value.context))}>
        Save
      </button>

      <button @click=${() => (assessmentTestEl.value.context = JSON.parse(localStorage.getItem('context')))}>
        Load
      </button>

      <button
        @click=${() =>
          (assessmentTestEl.value.signalContext.value = {
            ...assessmentTestEl.value.signalContext.value,
            itemIndex: 2
          })}
      >
        Volgende
      </button>

      <qti-assessment-test
        ${ref(assessmentTestEl)}
        @on-test-set-item=${({ detail: identifier }) => requestItem(identifier)}
        @qti-assessment-first-updated="${(e: CustomEvent<QtiAssessmentTest>) => {
          if (JSON.parse(localStorage.getItem('context'))) {
            e.detail.context = JSON.parse(localStorage.getItem('context'));
          }
        }}"
      >
        <test-show-index></test-show-index>
        <qti-test-part>
          <qti-assessment-section>
            ${loadeditems.items.map(
              item =>
                html`<qti-assessment-item-ref
                  item-location=${`${args.serverLocation}/${args.qtipkg}/depitems/`}
                  identifier="${item.identifier}"
                  href="${item.href}"
                >
                </qti-assessment-item-ref>`
            )}
          </qti-assessment-section>
        </qti-test-part>

        <test-prev>PREV</test-prev>
        <test-progress></test-progress>
        <test-paging-buttons></test-paging-buttons>
        <test-paging-radio></test-paging-radio>
        <test-slider></test-slider>
        <test-next>NEXT</test-next>
        <test-show-correct>correct</test-show-correct>
        <!-- <test-print-variables></test-print-variables> -->
      </qti-assessment-test>
    `;
  },
  loaders: [
    async args => ({
      loadeditems: await fetch(`${args.args.serverLocation}/${args.args.qtipkg}/items.json`)
        .then(response => (response.ok ? response.json() : console.log('error')))
        .catch(console.log)
    })
  ]
};

/* .context=${JSON.parse(localStorage.getItem('context'))} */
