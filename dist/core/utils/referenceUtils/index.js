'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var bibliographicTypes = ['article', 'book', 'booklet', 'collection', 'conference', 'inbook', 'incollection', 'inproceedings', 'manual', 'mastersthesis', 'phdthesis', 'proceedings', 'techreport', 'unpublished'];

var isBibliographical = function isBibliographical(bibType) {
  var isOk = bibliographicTypes.find(function (type) {
    return bibType === type;
  });
  return isOk !== undefined;
};

var computeReferences = exports.computeReferences = function computeReferences(sections, settings) {
  if (settings.referenceScope === 'document') {
    var _ret = function () {
      var references = sections.reduce(function (refs, section) {
        return refs.concat(section.resources.filter(function (resource) {
          return resource.inheritedVerticallyFrom === undefined;
        }));
      }, []);

      // handle filters
      var filters = (settings.referenceFilters || []) && settings.referenceFilters.split(' ');
      var filteredReferences = filters.reduce(function (outputReferences, filter) {
        switch (filter) {
          case 'has-title':
            return outputReferences.filter(function (ref) {
              return ref.title !== undefined;
            });
          case 'bibliographical':
            return outputReferences.filter(function (ref) {
              return isBibliographical(ref.bibType);
            });
          // todo : document filters
          // todo : design new filters
          default:
            return outputReferences;
        }
      }, references);

      // order references
      var order = settings.referenceSortBy;
      var sortedReferences = filteredReferences.sort(function (ref1, ref2) {
        switch (order) {
          case 'title':
            return (ref1.title && ref1.title.toLowerCase()) > (ref2.title && ref2.title.toLowerCase()) ? 1 : -1;
          case 'authors':
            var print1 = ref1.author && ref1.author.reduce(function (str1, author1) {
              return str1 + author1.lastName + '-';
            }, '');
            var print2 = ref2.author && ref2.author.reduce(function (str2, author2) {
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
      return {
        v: sortedReferences
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
};