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

function isBibliographical(bibType) {
  const isOk = bibliographicTypes.find((type)=> {
    return bibType === type;
  });
  return isOk !== undefined;
}

export function computeReferences(sections, renderingParams) {
  if (renderingParams.referenceScope === 'document') {
    const references = sections.reduce((refs, section)=> {
      return refs.concat(section.resources.filter((resource)=> {
        return resource.inheritedVerticallyFrom === undefined;
      }));
    }, []);

    // handle filters
    const filters = (renderingParams.referenceFilters || []) && renderingParams.referenceFilters.split(' ');
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
      // todo : design new filters
      default:
        return outputReferences;
      }
    }, references);

    // order references
    const order = renderingParams.referenceSortBy;
    const sortedReferences = filteredReferences.sort((ref1, ref2)=> {
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
}
