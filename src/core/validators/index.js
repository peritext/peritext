/**
 * Validators check some data against some models.
 * They should record errors and return them in a callback along with input data, either in first argument or in a {errors, data} second argument.
 * They should not modify/correct input data.
 * @module validators
 */

export {validateResources} from './sectionValidator';
