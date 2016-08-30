'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pdfExporter = require('./pdfExporter');

Object.defineProperty(exports, 'exportSectionToPdf', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_pdfExporter).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }