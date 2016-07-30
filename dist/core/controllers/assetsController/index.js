'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var connector = void 0;
var connectorName = void 0;
var tempConnectorName = void 0;

var updateConnector = function updateConnector(params) {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    connector = require('./../../../connectors/' + params.connector);
  }
};

var getAssetUri = exports.getAssetUri = function getAssetUri(path, params, callback) {
  updateConnector(params);
  connector.getAssetUri({ path: path, params: params }, callback);
};

var getReader = exports.getReader = function getReader(params) {
  updateConnector(params);
  return connector.readFromPath;
};