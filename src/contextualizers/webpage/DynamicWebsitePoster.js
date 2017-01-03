import React, {PropTypes} from 'react';
import Iframe from 'react-iframe';
import {StructuredHyperLink} from './../../core/components';

import renderContents from './../../core/utils/componentsFactory';

/**
 * dumb static-oriented component for displaying a webpage poster image
 */
export default class DynamicWebsitePoster extends React.Component {

  /**
   * propTypes
   * @property {string} schematype html schema type of the element
   * @property {object} resource the resource to be parsed
   * @property {array} captionContent what to display as caption
   * @property {number} figureNumber in static mode, the number of the figure
   */
  static propTypes = {
    schematype: PropTypes.string,
    resources: PropTypes.array.isRequired,
    // captionContent: PropTypes.oneOfType([
    //   PropTypes.array,
    //   PropTypes.string
    // ]),
    figureNumber: PropTypes.number,
    id: PropTypes.string
  };

  static defaultProps = {
    schematype: 'website',
    captionContent: ''
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const invisibleStyle = {
      display: 'none'
    };
    const contents = [
      {
        node: 'text',
        text: this.props.resources[0].url
      }
    ];
    return (
            <figure
              role="group"
              className="peritext-static-website-poster-container peritext-figure-container"
              itemScope
              itemProp="citation"
              itemType={'http://schema.org/' + this.props.schematype}
              typeof={this.props.schematype}
              resource={'#' + this.props.resources[0].id}
              id={'peritext-figure-' + this.props.id}
            >
              <span
                itemProp="name"
                property="name"
                style={invisibleStyle}
              >
                {this.props.resources[0].title}
              </span>
              <Iframe url={this.props.resources[0].url} />
              <figcaption
                itemProp="description"
                property="description"
              >
                {renderContents(this.props.captionContent)} – <StructuredHyperLink contents={contents} resource={this.props.resources[0]}/>
              </figcaption>
            </figure>
          );
  }
}
