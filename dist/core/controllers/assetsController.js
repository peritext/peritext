'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Assets controller - a set of pure functions for interacting with an assets source (through a connector)
 * @module controllers/assetsController
 */

var connector = void 0;
var connectorName = void 0;
var tempConnectorName = void 0;

/**
* Updates the active connector module according to connection params
* @param {Object} params - connection params
*/
var updateConnector = function updateConnector(params) {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    connector = require('./../../connectors/' + params.connector);
  }
};

/**
 * Provides the URI of a specific assets file from connector
 * @param {array|string} path - the path of the assets file to look for
 * @param {Object} params - connection params
 * @return {function(connectorError: error, uri: string)} callback - possible errors and the uri
*/
var getAssetUri = exports.getAssetUri = function getAssetUri(path, params, callback) {
  updateConnector(params);
  connector.getAssetUri({ path: path, params: params }, callback);
};

/**
* Returns an appropriate connector function for directly reading a file from assets source
* @param {Object} params - connection params
* @return {function(err: error, res: Object)} readFunction - the connector function for directly reading a file contents from assets source
*/
var getReader = exports.getReader = function getReader(params) {
  updateConnector(params);
  return connector.readFromPath;
};