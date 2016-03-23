import {parseBibTexStr} from './../bibTexConverter/';
import {map as asyncMap} from 'async';

export function parseTreeResources(dumbTree, callback){
  if(dumbTree.resourcesStr){
    parseBibTexStr(dumbTree.resourcesStr, function(err, resources){
      if(dumbTree.children){
        asyncMap(dumbTree.children, parseTreeResources, function(err, children){
          callback(err, Object.assign({}, dumbTree, {resources}, {children}));
        });
      }
    })
  }else callback(null, Object.assign({}, dumbTree));
}
