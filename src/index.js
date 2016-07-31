/**
 * Peritext library entrypoint
 * @module peritext
 */

import * as assetsC from './core/controllers/assetsController';
import * as contentsC from './core/controllers/contentsController';
import * as models from './core/models';
import * as parameters from './config/defaultParameters';

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
export {exportSectionToPdf} from './exporters/pdfExporter';
