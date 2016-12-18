import {
  computeReferences
} from './utils/referenceUtils';


export const getDocument = (document) => Object.assign({}, document);

export const getDocumentMetadata = (document) => Object.assign({}, document.metadata);

const packSection = (document, section) => {
  const mappedContextualizations = section.contextualizations.map(key =>
    document.contextualizations[key]
  );

  const contextualizations = mappedContextualizations.reduce((total, item) =>
    Object.assign(total, {[item.id]: item}), {});

  const contextualizers = mappedContextualizations.map(cont =>
    document.contextualizers[cont.contextualizer]
  ).reduce((total, item) =>
    Object.assign(total, {[item.id]: item}), {});
  const resources = mappedContextualizations.reduce((res, contextualization) => {
    return res.concat(contextualization.resources.map((resKey)=>{
      return document.resources[resKey];
    }));
  }, []).reduce((total, item) =>
      Object.assign(total, {[item.id]: item}), {});

  return Object.assign({},
    section,
    {contextualizations},
    {contextualizers},
    {resources}
  );
};

export const getSection = (document, id) => {
  const section = document.sections[id];
  return packSection(document, section);
};

export const getForewords = (document) => {
  const section = document.forewords;
  return packSection(document, section);
};

export const getTableOfSections = (document) =>
  document.summary.map(sectionKey =>{
    const metadata = document.sections[sectionKey].metadata;
    return {
      id: metadata.general.id.value,
      generalityLevel: metadata.general.generalityLevel.value,
      title: metadata.general.title.value,
      parent: metadata.general.parent ? metadata.general.parent.value : undefined
    };
  });

export const getDocumentBibliography = (document, settings, preRenderContexts) =>
  computeReferences(document, settings, preRenderContexts);

export const getTableOfFigures = (document) =>
  Object.keys(document.contextualizations)
  .map(key => document.contextualizations[key])
  .filter(contextualization => contextualization.figureId)
  .map(contextualization => ({
    figureId: contextualization.figureId,
    figureNumber: contextualization.figureNumber,
    contextualization
  }));

export const getResourceContextualizations = (document, resourceId) =>
  Object.keys(document.contextualizations)
    .map(key => document.contextualizations[key])
    .filter(contextualization =>
      contextualization.resources.indexOf(resourceId) > -1
    );

export const getContextualizerContextualizations = (document, contextualizerId) =>
  Object.keys(document.contextualizations)
    .map(key => document.contextualizations[key])
    .filter(contextualization =>
      contextualization.contextualizer === contextualizerId
    );

export const getGlossary = (document, preRenderContexts = true) => {
  const entitiesTypes = ['person', 'place', 'subject', 'concept', 'organization', 'technology', 'artefact'];
  const sections = Object.keys(document.sections).map(key => document.sections[key]);
  // get all glossary contextualizations
  const glossaryPointers = sections.reduce((results, thatSection)=>{
    const sectionCitekey = thatSection.metadata.general.id.value;
    return results.concat(
      thatSection.contextualizations
      .filter((thatContextualization)=> {
        return document.contextualizations[thatContextualization].contextualizerType === 'glossary';
      })
      .reduce((localResults, contextualizationKey)=> {
        const contextualization = document.contextualizations[contextualizationKey];
        const targetBlockPath = contextualization.nodePath.slice(0, 3);
        let context;
        if (preRenderContexts) {
          const sectionId = contextualization.nodePath[0];
          const contentCategory = contextualization.nodePath[1];
          const blockNumber = contextualization.nodePath[2];
          const contextBlock = document.sections[sectionId][contentCategory][blockNumber];
          const previousBlock = (blockNumber > 0) ? document.sections[sectionId][contentCategory][blockNumber - 1] : undefined;
          const nextBlock = (blockNumber < document.sections[sectionId][contentCategory].length - 1) ? document.sections[sectionId][contentCategory][blockNumber + 1] : undefined;
          context = {
            previousBlock,
            contextBlock,
            nextBlock
          };
        }
        return localResults.concat({
          mentionId: '#peritext-static-entity-inline-' + sectionCitekey + '-' + contextualization.id,
          id: contextualization.id,
          entity: document.resources[contextualization.resources[0]].id,
          alias: document.contextualizers[contextualization.contextualizer].alias,
          targetBlockPath,
          nodePath: contextualization.nodePath,
          context
        });
      }, []));
  }, []);
  // regroup related resources
  const glossaryResources = [];
  Object.keys(document.resources)
  .map(refKey => {
    const thatResource = document.resources[refKey];
    if (thatResource.inheritedVerticallyFrom === undefined
        && entitiesTypes.indexOf(thatResource.bibType) > -1
        ) {
      glossaryResources.push(thatResource);
    }
  });
  // reduce to have a one-entry-per-entity glossary
  const glossaryData = glossaryResources.map((inputGlossaryEntry)=> {
    const glossaryEntry = Object.assign({}, inputGlossaryEntry);
    // retroup resources
    glossaryEntry.aliases = glossaryPointers.filter((pointer)=> {
      return pointer.entity === glossaryEntry.id;
    }).reduce((aliases, entry)=> {
      const alias = entry.alias || 'no-alias';
      aliases[alias] = aliases[alias] ? aliases[alias].concat(entry) : [entry];
      return aliases;
    }, {});
    return glossaryEntry;
  }).sort((entry1, entry2)=> {
    return (entry1.name || entry1.lastname) > (entry2.name || entry2.lastname) ? 1 : -1;
  });
  return glossaryData;
};
