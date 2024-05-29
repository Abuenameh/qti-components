// function logCustomEvent(event) {
//   console.log('l:', event.type, event.target.tagName, event.detail);
// }

// function isCustomEvent(eventType) {
//   const standardEvents = [
//     'click',
//     'dblclick',
//     'mousedown',
//     'mouseup',
//     'mouseover',
//     'mousemove',
//     'mouseout',
//     'mouseenter',
//     'mouseleave',
//     'keydown',
//     'keypress',
//     'keyup',
//     'change',
//     'input',
//     'submit',
//     'focus',
//     'blur',
//     'resize',
//     'scroll',
//     'load',
//     'unload',
//     'error',
//     'abort',
//     'drag',
//     'drop',
//     'contextmenu',
//     'wheel',
//     'copy',
//     'cut',
//     'paste',
//     'pointermove',
//     'pointerout',
//     'pointerover',
//     'pointerdown',
//     'selectionchange',
//     'pointerup'
//   ];
//   return !standardEvents.includes(eventType);
// }

// const originalAddEventListener = EventTarget.prototype.addEventListener;
// EventTarget.prototype.addEventListener = function (type, listener, options) {
//   if (isCustomEvent(type)) {
//     originalAddEventListener.call(this, type, logCustomEvent, options);
//   }
//   originalAddEventListener.call(this, type, listener, options);
// };

// const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
// EventTarget.prototype.dispatchEvent = function (event: CustomEvent) {
//   if (isCustomEvent(event.type)) {
//     console.log('d:', event.type, this.tagName, event.detail);
//   }
//   return originalDispatchEvent.call(this, event);
// };

import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../custom-elements.json';

import '../src/item.css';

import { customViewports } from './custom-viewport-sizes';
setCustomElementsManifest(customElements);

const preview: Preview = {
  globalTypes: {
    pseudo: {}
  },
  // https://storybook.js.org/docs/web-components/essentials/controls#custom-control-type-matchers
  parameters: {
    controls: {
      expanded: true
    },
    viewport: { viewports: customViewports }
  }
};

export default preview;
