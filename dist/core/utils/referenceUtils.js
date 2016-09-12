'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * Utils - dedicated to representing a reference/bibliography section
 * @module utils/referenceUtils
 */

var bibliographicTypes = ['article', 'book', 'booklet', 'collection', 'conference', 'inbook', 'incollection', 'inproceedings', 'manual', 'mastersthesis', 'phdthesis', 'proceedings', 'techreport', 'unpublished'];

/**
 * Checks whether a given references belongs to a "traditional" bibliographical reference (journal article, book, ...)
 * @param {string} bibType - the bibType of the resource
 * @return {boolean} isBibliographical
 */
var isBibliographical = function isBibliographical(bibType) {
  var bibliType = bibliographicTypes.find(function (type) {
    return bibType === type;
  });
  return bibliType !== undefined;
};

/**
 * Filter and order a list of resources against bibliography settings
 * @param {array} sections - the sections to handle for building the list
 * @param {Object} document - the reference to the overall document
 * @param {Object} settings - the rendering settings, among which are bibliography-making related settings
 * @return {array} references - the resulting list
 */
var computeReferences = exports.computeReferences = function computeReferences(sections, document, settings) {
  if (settings.referenceScope === 'document') {
    var _ret = function () {
      var references = [];
      for (var key in document.resources) {
        if (document.resources[key]) {
          references.push(document.resources[key]);
        }
      }

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
          // todo : design other filters
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