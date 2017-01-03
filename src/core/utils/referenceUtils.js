import {retrieveContext} from '../getters';

/**
 * Utils - dedicated to representing a reference/bibliography section
 * @module utils/referenceUtils
 */

const bibliographicTypes = [
  'article',
  'book',
  'booklet',
  'collection',
  'conference',
  'inbook',
  'incollection',
  'inproceedings',
  'manual',
  'mastersthesis',
  'phdthesis',
  'proceedings',
  'techreport',
  'unpublished'
];

/**
 * Checks whether a given references belongs to a "traditional" bibliographical reference (journal article, book, ...)
 * @param {string} bibType - the bibType of the resource
 * @return {boolean} isBibliographical
 */
const isBibliographical = (bibType) =>{
  const bibliType = bibliographicTypes.find((type)=> {
    return bibType === type;
  });
  return bibliType !== undefined;
};

/**
 * Filter and order a list of resources against bibliography settings
 * @param {array} sections - the sections to handle for building the list
 * @param {Object} settings - the rendering settings, among which are bibliography-making related settings
 * @return {array} references - the resulting list
 */
export const computeReferences = (document, settings, preRenderContexts = true) =>{
  if (settings.referenceScope === 'document') {
    const references = [];
    for (const key in document.resources) {
      if (document.resources[key]) {
        references.push(document.resources[key]);
      }
    }
    // handle filters
    const filters = (settings.referenceFilters || []) && settings.referenceFilters.split(' ');
    const filteredReferences = filters.reduce((outputReferences, filter)=> {
      switch (filter) {
      case 'has-title':
        return outputReferences.filter((ref)=> {
          return ref.title !== undefined;
        });
      case 'bibliographical':
        return outputReferences.filter((ref)=> {
          return isBibliographical(ref.bibType);
        });
      // todo : document filters
      // todo : design other filters
      default:
        return outputReferences;
      }
    }, references);

    // retrieve related contextualizations
    const improvedReferences = filteredReferences.map((reference) => {
      const contextualizations = Object.keys(document.contextualizations)
                                  .map(key => document.contextualizations[key])
                                  .filter(contextualization =>
                                    contextualization.resources.indexOf(reference.id) > -1
                                  )
                                  .map(contextualization => {
                                    // render contextualization content if asked (containing block, + former and previous)
                                    if (preRenderContexts) {
                                      const sectionId = contextualization.nodePath[0];
                                      return Object.assign({}, contextualization, {
                                        sectionTitle: document.sections[sectionId].metadata.general.title.value,
                                        context: retrieveContext(document, contextualization)
                                      });
                                    }
                                    return contextualization;
                                  });
      return Object.assign(reference, {contextualizations});
    });

    // order references
    const order = settings.referenceSortBy;
    const sortedReferences = improvedReferences.sort((ref1, ref2)=> {
      switch (order) {
      case 'title':
        return (ref1.title && ref1.title.toLowerCase()) > (ref2.title && ref2.title.toLowerCase()) ? 1 : -1;
      case 'authors':
        const print1 = ref1.author && ref1.author.reduce((str1, author1)=> {
          return str1 + author1.lastName + '-';
        }, '');
        const print2 = ref2.author && ref2.author.reduce((str2, author2)=> {
          return str2 + author2.lastName + '-';
        }, '');
        return print1 > print2 ? 1 : -1;
      case 'year':
        return ref1.year > ref2.year ? 1 : -1;
      case 'type':
        return ref1.bibType > ref2.bibType ? 1 : -1;
      default:
        return 1;
      }
    });
    return sortedReferences;
  }
};
