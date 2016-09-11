'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.iso690fr = undefined;

var _iso690fr = require('./iso690fr');

var iso690frLib = _interopRequireWildcard(_iso690fr);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * ISO 690 style citation - formatted in french language
 * @todo : try to internationalize it from scratch in order to have language-agnostic citation modules ?
 */
var iso690fr = exports.iso690fr = iso690frLib; /**
                                                * Set of citation style-specific components
                                                * @module referencers
                                                */