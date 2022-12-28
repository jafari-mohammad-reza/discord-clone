export default function parseIndexDocument(indexDocument: Object) {
  const blackListData = ['', ' ', null, 'null', undefined, 'undefined'];
  Object.keys(indexDocument).map((key: string) => {
    blackListData.includes(indexDocument[key]) && delete indexDocument[key];
    Array.isArray(indexDocument[key]) &&
      indexDocument[key].length > 0 &&
      indexDocument[key].map((item) => item.trim());
    typeof indexDocument[key] === 'string' && indexDocument[key].trim();
    Array.isArray(indexDocument[key]) &&
      indexDocument[key].length === 0 &&
      delete indexDocument[key];
  });
  return indexDocument;
}
