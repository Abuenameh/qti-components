import { expect } from '@esm-bundle/chai';
import { qtiTransformItem } from '../src/lib/qti-transformers';

const xml = String.raw;

it('sums up 2 numbers', () => {
  const xmlIn = xml`<qti-custom-operator class="js.org"><qti-base-value base-type="string"><![CDATA[console.log(context.variables);]]></qti-base-value></qti-custom-operator>`;
  const xmlResult = qtiTransformItem().parse(xmlIn).convertCDATAtoComment().html();
  const xmlAssert = xml`<qti-custom-operator xmlns="http://www.w3.org/1999/xhtml" class="js.org"><qti-base-value base-type="string"><!--console.log(context.variables);--></qti-base-value></qti-custom-operator>`;
  expect(xmlResult.trim()).to.equal(xmlAssert.trim());
});
