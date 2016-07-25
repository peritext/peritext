import React, {PropTypes} from 'react';
import StaticImageFigure from './StaticImageFigure.js';
import StructuredHyperLink from './../StructuredDataComponents/StructuredHyperLink.js';
import Radium from 'radium';

// let styles = {};

/**
 * dumb static-oriented component for displaying a webpage poster image
 */
@Radium
export default class StructuredWebsitePoster extends React.Component {

  /**
   * propTypes
   * @property {string} schematype html schema type of the element
   * @property {object} resource the resource to be parsed
   * @property {string} captionContent what to display as caption
   * @property {number} figureNumber in static mode, the number of the figure
   */
  static propTypes = {
    schematype: PropTypes.string,
    resource: PropTypes.object.isRequired,
    captionContent: PropTypes.string,
    figureNumber: PropTypes.number
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
    return (
            <figure
              role="group"
              className="peritext-contents-website-poster peritext-contents-figure"
              itemScope
              itemProp="citation"
              itemType={'http://schema.org/' + this.props.schematype}
              typeof={this.props.schematype}
              resource={'#' + this.props.resource.citeKey}
              id={this.props.figureNumber ? 'peritext-contents-figure-' + this.props.figureNumber : undefined }
            >
              <span
                itemProp="name"
                property="name"
                style={invisibleStyle}
              >
                {this.props.resource.title}
              </span>
              <StaticImageFigure {...this.props} />
              <figcaption
                itemProp="description"
                property="description"
              >
                Figure {this.props.figureNumber} – {this.props.captionContent} – <StructuredHyperLink text={this.props.resource.url} resource={this.props.resource}/>
              </figcaption>
            </figure>
          );
  }
}
