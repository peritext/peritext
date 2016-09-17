/**
 * Webpage contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/webpage
 */

 import { get as getByPath } from 'object-path';

 import {StructuredHyperLink} from './../../core/components';
 import StaticWebsitePoster from './StaticWebsitePoster.js';

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
 export const contextualizeInlineStatic = (inputDocument, inputContextualization, settings) => {
   const document = Object.assign({}, inputDocument);
   const contextualization = Object.assign({}, inputContextualization);
   const sectionId = contextualization.nodePath[0];
   const path = ['sections', ...contextualization.nodePath.slice()];
   const node = getByPath(document, path);
   const section = document.sections[sectionId];

   const link = {
     node: 'element',
     tag: StructuredHyperLink,
     special: true,
     props: {
       resource: document.resources[contextualization.resources[0]],
       contents: [{
         node: 'text',
         text: document.resources[contextualization.resources[0]].url
       }]
     }
   };
   const noteNumber = section.notes.length + 1;
   const noteId = sectionId + '-' + noteNumber;
   section.notes.push({
     noteNumber,
     child: [link],
     id: noteId
   });
   node.child = [
     ...node.child,
     {
       element: 'node',
       tag: 'note',
       target: noteId
     }
   ];

   return document;
 };

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
 export const contextualizeBlockStatic = (inputDocument, inputContextualization, settings) => {
   const document = Object.assign({}, inputDocument);
   const contextualization = Object.assign({}, inputContextualization);
   const sectionId = contextualization.nodePath[0];
   const path = ['sections', ...contextualization.nodePath.slice()];
   const node = getByPath(document, path);
   const section = document.sections[sectionId];
   let figureId;
   figureId = sectionId + '-' + contextualization.id;
   document.figuresCount = document.figuresCount ? document.figuresCount + 1 : 1;
   contextualization.figureId = figureId;
   contextualization.figureNumber = document.figuresCount;
   const captionContent = node.child && node.child[0] && node.child[0].child || undefined;
   const figure = {
     node: 'element',
     special: true,
     tag: StaticWebsitePoster,
     props: {
       imageKey: 'posterurl',
       resource: document.resources[contextualization.resources[0]],
       captionContent,
       figureNumber: contextualization.figureNumber,
       id: figureId
     }
   };

   if (settings.figuresPosition === 'inline') {
     const nodeBlockIndex = path[3];
     section.contents[nodeBlockIndex] = figure;
   } else {
     section.figures = section.figures ? section.figures.concat(figure) : [figure];
   }
   document.contextualizations[contextualization.id] = contextualization;
   return document;
 };

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
 export const contextualizeInlineDynamic = (inputDocument, contextualization, settings) => {
   return inputDocument;
 };

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext section in which the contextualization was made
 */
 export const contextualizeBlockDynamic = (inputDocument, contextualization, settings) => {
   return inputDocument;
 };
