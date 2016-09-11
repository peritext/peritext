
export const getDocument = (document) => Object.assign({}, document);

const packSection = (document, section) => {
  const contextualizations = section.contextualizations.map(key =>
    document.contextualizations[key]
  );
  const contextualizers = contextualizations.map(cont =>
    document.contextualizers[cont.contextualizer]
  );
  const resources = contextualizations.reduce((res, contextualization) => {
    return res.concat(contextualization.resources.map((resKey)=>{
      return document.resources[resKey];
    }));
  }, []);
  return Object.assign({},
    section,
    {contextualizations},
    {contextualizers},
    {resources}
  );
}

export const getSection = (document, citeKey) => {
  const section = document.sections[citeKey];
  return packSection(document, section);
}

export const getForewords = (document) => {
  const section = document.forewords;
  return packSection(document, section);
}


export const getTableOfSections = (document) =>
  document.summary.map(sectionKey =>{
    const metadata = document.sections[sectionKey].metadata;
    return {
      citeKey: metadata.general.citeKey.value,
      generalityLevel: metadata.general.generalityLevel.value,
      title: metadata.general.title.value,
      parent: metadata.general.parent ? metadata.general.parent.value : undefined,
    }
  });

export const getTableOfFigures = (document) =>
  Object.keys(document.contextualizations)
  .map(key => document.contextualizations[key])
  .filter(contextualization => contextualization.figureId)
  .map(contextualization => ({
    figureId: contextualization.figureId,
    figureNumber: contextualization.figureNumber
  }));

export const getResourceContextualizations = (document, resourceCiteKey) =>
  Object.keys(document.contextualizations)
    .map(key => document.contextualizations[key])
    .filter(contextualization =>
      contextualization.resources.indexOf(resourceCiteKey) > -1
    )

export const getContextualizerContextualizations = (document, contextualizerCiteKey) =>
  Object.keys(document.contextualizations)
    .map(key => document.contextualizations[key])
    .filter(contextualization =>
      contextualization.contextualizer === contextualizerCiteKey
    )

export const getGlossary = (document) => {
  const entitiesTypes = ['person', 'place', 'subject', 'concept', 'organization', 'technology', 'artefact'];
  const sections = Object.keys(document.sections).map(key => document.sections[key]);
  // prepare glossary
  const glossaryPointers = sections.reduce((results, thatSection)=>{
    const sectionCitekey = thatSection.metadata.general.citeKey.value;
    return results.concat(
      thatSection.contextualizations
      .filter((thatContextualization)=> {
        return document.contextualizations[thatContextualization].contextualizerType === 'glossary';
      })
      .reduce((localResults, contextualizationKey)=> {
        const contextualization = document.contextualizations[contextualizationKey];
        return localResults.concat({
          mentionId: '#peritext-content-entity-inline-' + sectionCitekey + '-' + contextualization.citeKey,
          entity: document.resources[contextualization.resources[0]].citeKey,
          alias: document.contextualizers[contextualization.contextualizer].alias
        });
      }, []));
  }, []);

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

  const glossaryData = glossaryResources.map((inputGlossaryEntry)=> {
    const glossaryEntry = Object.assign({}, inputGlossaryEntry);
    glossaryEntry.aliases = glossaryPointers.filter((pointer)=> {
      return pointer.entity === glossaryEntry.citeKey;
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
}
