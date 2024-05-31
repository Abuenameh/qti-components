import { qtiTransformItem, qtiTransformTest } from '../lib/qti-transformers';

export const fetchItem = async (
  packageUri: string,
  index: number
): Promise<{
  itemXML: Element;
  items: {
    identifier: string;
    href: string;
    category: string;
  }[];
}> => {
  packageUri = packageUri.endsWith('/') ? packageUri : packageUri + '/';
  const assessmentTestHref = `assessment.xml`;
  const itemLocation = `${packageUri}${assessmentTestHref.substring(0, assessmentTestHref.lastIndexOf('/'))}/`;

  const itemsFromTest = await qtiTransformTest()
    .load(packageUri + assessmentTestHref)
    .then(api => api.items());

  const itemHTML = await qtiTransformItem()
    .load(itemLocation + itemsFromTest[index].href)
    .then(api => api.path(itemLocation).stripStyleSheets().htmldoc());

  return { itemXML: itemHTML.firstElementChild, items: itemsFromTest };
};
