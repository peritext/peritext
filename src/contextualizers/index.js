/**
 * Contextualizers - pure functions that resolve sections against contextualizations+settings objects
 * @module contextualizers
 */
import * as citationLib from './citation';
import * as timelineLib from './timeline';
import * as imagegalleryLib from './imagegallery';
import * as webpageLib from './webpage';
import * as glossaryLib from './glossary';
import * as tableLib from './table';

/**
 * Citation contextualizer that resolve sections data according to contextualization+settings params
 */
export const citation = citationLib;
/**
 * Timeline contextualizer that resolve sections data according to contextualization+settings params
 */
export const timeline = timelineLib;
/**
 * Image gallery contextualizer that resolve sections data according to contextualization+settings params
 */
export const imagegallery = imagegalleryLib;
/**
 * Webpage contextualizer that resolve sections data according to contextualization+settings params
 */
export const webpage = webpageLib;
/**
 * Glossary contextualizer that resolve sections data according to contextualization+settings params
 */
export const glossary = glossaryLib;
/**
 * Table contextualizer that resolve sections data according to contextualization+settings params
 */
export const table = tableLib;
