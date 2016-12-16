/**
 * Peritext library entrypoint
 * @module peritext
 */

import * as assetsC from './core/controllers/assetsController';
import * as contentsC from './core/controllers/contentsController';
import * as models from './core/models';
import * as parameters from './config/defaultParameters';
import componentsFactory from './core/utils/componentsFactory';
import * as getters from './core/getters';

/**
 * Exposes assets communication methods
 * @property {Object} assetsController
 */
export const assetsController = assetsC;
/**
 * Exposes contents communication methods
 * @property {Object} contentsController
 */
export const contentsController = contentsC;
/**
 * Exposes peritext default models for metadata, resources, contextualizers, and rendering settings
 * @property {Object} defaultModels
 */
export const defaultModels = models;
/**
 * Exposes default language parameters for includes and templates
 * @property {Object} defaultParameters
 */
export const defaultParameters = parameters;

/**
 * Exposes section export to pdf with print renderer function
 * @property {function} exportSectionToPdf
 */
export { exportDocumentToPdf } from './exporters/pdfExporter';
/**
 * Exposes dynqmic rendering modules
 * @property {function} exportSectionToPdf
 */
export {
  renderDocument as renderToDynamicDocument,
  renderObjectMetadata,
  resolveDocumentContextualizationsRelations,
  renderSectionContents
} from './renderers/renderToDynamicHtml';

export const renderContents = componentsFactory;

export const packSection = getters.packSection;
export const getSection = getters.getSection;
export const getForewords = getters.getForewords;
export const getTableOfSections = getters.getTableOfSections;
export const getTableOfFigures = getters.getTableOfFigures;
export const getResourceContextualizations = getters.getResourceContextualizations;
export const getContextualizerContextualizations = getters.getContextualizerContextualizations;
export const getGlossary = getters.getGlossary;
export const getDocumentMetadata = getters.getDocumentMetadata;

export {computeReferences} from './core/utils/referenceUtils';

export {resolveContextualizationImplementation} from './core/resolvers/resolveContextualizations';


import * as coreComponents from './core/components';
import StaticTable from './contextualizers/table/StaticTable';
import StaticEntityBlock from './contextualizers/glossary/StaticEntityBlock';
import StaticEntityInline from './contextualizers/glossary/StaticEntityInline';
import StaticImageGallery from './contextualizers/imagegallery/StaticImageGallery';
import StaticWebsitePoster from './contextualizers/webpage/StaticWebsitePoster';


import {
  BlockCitation as BlockCitationiso690fr,
  InlineCitation as InlineCitationiso690fr
} from './referencers/iso690fr';

export const components = Object.assign({}, coreComponents, {
  StaticTable,
  StaticEntityBlock,
  StaticEntityInline,
  StaticImageGallery,
  StaticWebsitePoster,
  BlockCitationiso690fr,
  InlineCitationiso690fr
});
