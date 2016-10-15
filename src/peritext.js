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
  resolveContextualizationsRelations,
  renderSection
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
