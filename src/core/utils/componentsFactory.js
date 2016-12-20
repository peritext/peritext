/**
 * Utils - dedicated to consuming peritext contents' pseudo-dom representations by returning React markup
 * @module utils/modelUtils
 */
import React from 'react';
import {components} from '../../peritext';

/**
 * Consumes a peritext content's pseudo-dom node (described as a js object) and returns a react component
 * @param {Object} node - the pseudo-dom node
 * @param {number} index - the index of the node (used for providing react keys)
 * @return {ReactElement} markup describing the node
 */
export const jsToComponent = (node, index)=> {
  if (node.node === 'text') {
    return node.text;
  }
  if (node.special && node.tag) {
    // Component class stored as referenced object
    // const Component = node.tag;
    const Component = components[node.tag];
    return <Component id={node.attr && node.attr.id} key={index} {...node.props} />;
  }
  // plain string tag name (p, span, ...)
  if (node.tag) {
    const Tag = node.tag;
    return (<Tag key={index} className={node.attr && node.attr.className} id={node.attr && node.attr.id} href={node.attr && node.attr.href}>
      {node.children && node.children.map(jsToComponent)}
    </Tag>);
  }
  // if no react tag to use, render harmless empty string
  return '';
};

/**
 * Consumes a peritext content's pseudo-dom nodes list to produce react markup
 * @param {Object} contents - the pseudo-dom nodes array
 * @return {ReactElement|string} markup or string contents
 */
export default function renderContents(contents) {
  if (Array.isArray(contents)) {
    return contents.map(jsToComponent);
  } else if (typeof contents === 'string') {
    return contents;
  }
  return '';
}
