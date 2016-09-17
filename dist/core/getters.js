'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getDocument = exports.getDocument = function getDocument(document) {
  return Object.assign({}, document);
};

var getDocumentMetadata = exports.getDocumentMetadata = function getDocumentMetadata(document) {
  return Object.assign({}, document.metadata);
};

var packSection = function packSection(document, section) {
  var contextualizations = section.contextualizations.map(function (key) {
    return document.contextualizations[key];
  });
  var contextualizers = contextualizations.map(function (cont) {
    return document.contextualizers[cont.contextualizer];
  });
  var resources = contextualizations.reduce(function (res, contextualization) {
    return res.concat(contextualization.resources.map(function (resKey) {
      return document.resources[resKey];
    }));
  }, []);
  return Object.assign({}, section, { contextualizations: contextualizations }, { contextualizers: contextualizers }, { resources: resources });
};

var getSection = exports.getSection = function getSection(document, citeKey) {
  var section = document.sections[citeKey];
  return packSection(document, section);
};

var getForewords = exports.getForewords = function getForewords(document) {
  var section = document.forewords;
  return packSection(document, section);
};

var getTableOfSections = exports.getTableOfSections = function getTableOfSections(document) {
  return document.summary.map(function (sectionKey) {
    var metadata = document.sections[sectionKey].metadata;
    return {
      citeKey: metadata.general.citeKey.value,
      generalityLevel: metadata.general.generalityLevel.value,
      title: metadata.general.title.value,
      parent: metadata.general.parent ? metadata.general.parent.value : undefined
    };
  });
};

var getTableOfFigures = exports.getTableOfFigures = function getTableOfFigures(document) {
  return Object.keys(document.contextualizations).map(function (key) {
    return document.contextualizations[key];
  }).filter(function (contextualization) {
    return contextualization.figureId;
  }).map(function (contextualization) {
    return {
      figureId: contextualization.figureId,
      figureNumber: contextualization.figureNumber
    };
  });
};

var getResourceContextualizations = exports.getResourceContextualizations = function getResourceContextualizations(document, resourceCiteKey) {
  return Object.keys(document.contextualizations).map(function (key) {
    return document.contextualizations[key];
  }).filter(function (contextualization) {
    return contextualization.resources.indexOf(resourceCiteKey) > -1;
  });
};

var getContextualizerContextualizations = exports.getContextualizerContextualizations = function getContextualizerContextualizations(document, contextualizerCiteKey) {
  return Object.keys(document.contextualizations).map(function (key) {
    return document.contextualizations[key];
  }).filter(function (contextualization) {
    return contextualization.contextualizer === contextualizerCiteKey;
  });
};

var getGlossary = exports.getGlossary = function getGlossary(document) {
  var entitiesTypes = ['person', 'place', 'subject', 'concept', 'organization', 'technology', 'artefact'];
  var sections = Object.keys(document.sections).map(function (key) {
    return document.sections[key];
  });
  // prepare glossary
  var glossaryPointers = sections.reduce(function (results, thatSection) {
    var sectionCitekey = thatSection.metadata.general.citeKey.value;
    return results.concat(thatSection.contextualizations.filter(function (thatContextualization) {
      return document.contextualizations[thatContextualization].contextualizerType === 'glossary';
    }).reduce(function (localResults, contextualizationKey) {
      var contextualization = document.contextualizations[contextualizationKey];
      return localResults.concat({
        mentionId: '#peritext-content-entity-inline-' + sectionCitekey + '-' + contextualization.citeKey,
        entity: document.resources[contextualization.resources[0]].citeKey,
        alias: document.contextualizers[contextualization.contextualizer].alias
      });
    }, []));
  }, []);

  var glossaryResources = [];
  Object.keys(document.resources).map(function (refKey) {
    var thatResource = document.resources[refKey];
    if (thatResource.inheritedVerticallyFrom === undefined && entitiesTypes.indexOf(thatResource.bibType) > -1) {
      glossaryResources.push(thatResource);
    }
  });

  var glossaryData = glossaryResources.map(function (inputGlossaryEntry) {
    var glossaryEntry = Object.assign({}, inputGlossaryEntry);
    glossaryEntry.aliases = glossaryPointers.filter(function (pointer) {
      return pointer.entity === glossaryEntry.citeKey;
    }).reduce(function (aliases, entry) {
      var alias = entry.alias || 'no-alias';
      aliases[alias] = aliases[alias] ? aliases[alias].concat(entry) : [entry];
      return aliases;
    }, {});
    return glossaryEntry;
  }).sort(function (entry1, entry2) {
    return (entry1.name || entry1.lastname) > (entry2.name || entry2.lastname) ? 1 : -1;
  });
  return glossaryData;
};