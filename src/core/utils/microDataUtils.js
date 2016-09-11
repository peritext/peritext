/**
 * Utils - Collection of utils for formatting scholarly citations in html+schema+RDFa+COiNS elements
 * @module utils/microDataUtils
 */

/**
 * Translates a peritext bibType to a schema.org Type
 * @param {string} bib - the peritext bibType
 * @return {string} SchemaType - the corresponding SchemaType
 */
export const bibToSchema = (bib) => {
  switch (bib) {
  case 'book':
    return 'Book';
  case 'article':
    return 'ScholarlyArticle';
  case 'booklet':
    return 'CreativeWork';
  case 'conference':
    return 'Chapter';
  case 'incollection':
    return 'Chapter';
  case 'inherits':
    return 'Chapter';
  case 'inbook':
    return 'Chapter';
  case 'mastersthesis':
    return 'Thesis';
  case 'phdthesis':
    return 'Thesis';
  case 'proceedings':
    return 'Book';
  case 'image':
    return 'ImageObject';
  case 'online':
    return 'WebSite';
  case 'vectorsImage':
    return 'ImageObject';
  case 'tabularData':
    return 'Dataset';
  case 'video':
    return 'VideoObject';
  case 'audio':
    return 'AudioObject';
  case 'person':
    return 'Person';
  case 'place':
    return 'Place';
  case 'organization':
    return 'Organization';
  // not very accurate
  case 'artefact':
    return 'Product';
  // no schematype for these ones (too abstract)
  case 'topic':
  case 'concept':
  case 'technology':
    return 'Thing';
  default:
    return 'CreativeWork';
  }
};

/*
  Context Objects in Spans (COiNS) related functions
*/

const addPropToCOinSData = (key, value) => {
  return {
    key: key,
    value: value
  };
};

const urify = (key, value) => {
  return key + '=' + encodeURIComponent(value);
};

const assembleUri = (infos) => {
  const vals = [];
  infos.forEach(function(info) {
    vals.push(urify(info.key, info.value));
  });
  return vals.join('&amp;');
};

const baseMap = {
  'rft.date': 'date',
  'rft.pages': 'pages',
  'rft.issn': 'ISSN',
  'rft.isbn': 'ISBN',
  'rft_id': 'url',
  'rft.place': 'address',
  'rft.pub': 'publisher'
};

const journalMap = {
  'rft.atitle': 'title',
  'rft.jtitle': 'journal',
  'rft.volume': 'volume',
  'rft.issue': 'issue'
};

const chapterMap = {
  'rft.atitle': 'title',
  'rft.btitle': 'booktitle'
};

const translate = (data, item, map) => {
  for (const key in map) {
    if (item[map[key]]) {
      data.push(addPropToCOinSData(key, item[map[key]]));
    }
  }
  return data;
};

/**
 * Generates an openUrl URI describing the resource, and aimed at being used in a ContextObjectInSpan (COinS)
 * @param {Object} resource - the resource to describe with an openUrl
 * @return {string} uri - the uri describing the resource
 */
export const generateOpenUrl = (resource) => {
  let data = [];
  data.push(addPropToCOinSData('ctx_ver', 'Z39.88-2004'));

  if (resource.author && resource.author.length) {
    resource.author.forEach(function(author) {
      data.push(addPropToCOinSData('rft.au', author.lastName + ', ' + author.firstName));
    });
  }
  data = translate(data, resource, baseMap);
  if (resource.bibType === 'journal' || resource.bibType === 'article') {
    data = translate(data, resource, journalMap);
    data.push(addPropToCOinSData('rft.genre', 'article'));
    data.push(addPropToCOinSData('rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal'));
  }else if (resource.bibType === 'proceedings' || resource.bibType === 'conferencePaper') {
    data = translate(data, resource, journalMap);
    data.push(addPropToCOinSData('rft.genre', 'conference'));
    data.push(addPropToCOinSData('rft_val_fmt', 'info:ofi/fmt:kev:mtx:book'));
  }else if (resource.bibType === 'chapter') {
    data = translate(data, resource, chapterMap);
    data.push(addPropToCOinSData('rft.genre', 'bookitem'));
    data.push(addPropToCOinSData('rft_val_fmt', 'info:ofi/fmt:kev:mtx:book'));
  }else {
    data.push(addPropToCOinSData('rft.genre', 'document'));
  }
  return assembleUri(data);
};
