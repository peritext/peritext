import {expect} from 'chai';

import {exists} from 'fs';
import {resolve} from 'path';
import * as lib from './../../../src/core/controllers/assetsController';
import {sample_assets_path} from "./../../test_settings.json";
const base_assets_path = __dirname + '/../../' + sample_assets_path;

const assetsParams = {
  connector: 'filesystem',
  basePath: base_assets_path
};

describe('assetsController:getAssetUri', ()=>{

  it('should return the proper assets uri for fs connector', (done)=>{
    const test = 'img.jpg';
    const expected = resolve(base_assets_path + '/' + test);
    lib.getAssetUri(test, assetsParams, (err, path)=>{
      expect(err).to.be.null;
      expect(path).to.equal(expected);
      done();
    });
  });
});

