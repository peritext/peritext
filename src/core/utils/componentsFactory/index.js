import React from 'react';

// import * as components from './index.js';

export const jsToComponent = (node, index)=> {
  if (node.node === 'text') {
    return node.text;
  }
  if (node.special) {
    // Component class stored as referenced object
    const Component = node.tag;
    return <Component key={index} {...node.props} />;
  }
  // plain string tag name
  const Tag = node.tag;
  return (<Tag key={index} id={node.attr && node.attr.id} href={node.attr && node.attr.href}>
    {node.child && node.child.map(jsToComponent)}
  </Tag>);
};

export default function renderContents(contents) {
  if (Array.isArray(contents)) {
    return contents.map(jsToComponent);
  } else if (typeof contents === 'string') {
    return contents;
  }
  return '';
}
