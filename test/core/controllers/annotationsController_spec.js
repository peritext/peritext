import {expect} from 'chai';

import * as connector from './../../../src/core/connectors/filesystem';
import {exists} from 'fs';
import {resolve} from 'path';
import * as lib from './../../../src/core/controllers/assetsController';
import {sample_assets_path} from "./../../test_settings.json";
const base_assets_path = __dirname + '/../../' + sample_assets_path;

describe('assetsController:getAssetUri', function(){

  it('should return the proper assets uri for fs connector', function(done) {
    const path = base_assets_path + '/';
    const test = 'img.jpg';
    const expected = resolve(path + test);
    lib.getAssetUri(connector, path + test, null, function(err, path) {
      expect(err).to.be.null;
      expect(path).to.equal(expected);
      done();
    });
  });
});
