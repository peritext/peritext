'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var contextualizeInlineStatic = exports.contextualizeInlineStatic = function contextualizeInlineStatic(inputSection, inputContextualization, settings) {
  var contextualization = Object.assign({}, inputContextualization);
  var formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  var node = contextualization.node;
  var props = {
    contextualization: contextualization,
    resource: contextualization.resources[0],
    ibid: contextualization.sectionIbid,
    opCit: contextualization.sectionOpCit
  };
  // citation text --> wrap in span > q + citation
  if (node.child) {
    var citation = {
      node: 'element',
      special: true,
      tag: formatter.InlineCitation,
      props: props
    };
    var child = node.child.slice();
    var quote = {
      attr: {
        class: 'peritext-quote-container',
        id: contextualization.citeKey
      },
      node: 'element',
      tag: 'q',
      child: child
    };
    node.node = 'element';
    node.tag = 'span';
    node.child = [quote, {
      node: 'text',
      text: ' ('
    }, citation, {
      node: 'text',
      text: ')'
    }];
  } else {
    node.special = true;
    node.tag = formatter.InlineCitation;
    node.props = props;
  }
  return Object.assign({}, inputSection);
};

var contextualizeBlockStatic = exports.contextualizeBlockStatic = function contextualizeBlockStatic(inputSection, inputContextualization, settings) {
  var contextualization = Object.assign({}, inputContextualization);
  var formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  var node = contextualization.node;
  var props = {
    contextualization: contextualization,
    resource: contextualization.resources[0],
    ibid: contextualization.sectionIbid,
    opCit: contextualization.sectionOpCit
  };
  node.special = true;
  node.tag = formatter.BlockCitation;
  node.props = props;
  return Object.assign({}, inputSection);
};

var contextualizeInlineDynamic = exports.contextualizeInlineDynamic = function contextualizeInlineDynamic(section, contextualization, settings) {
  return section;
};

var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(section, contextualization, settings) {
  return section;
};