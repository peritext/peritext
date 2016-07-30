import React, {PropTypes} from 'react';
import {StaticImageFigure, StructuredHyperLink} from './../../core/components';
import Radium from 'radium';

// let styles = {};
import renderContents from './../../core/utils/componentsFactory';

/**
 * dumb static-oriented component for displaying a webpage poster image
 */
@Radium
export default class StructuredWebsitePoster extends React.Component {

  /**
   * propTypes
   * @property {string} schematype html schema type of the element
   * @property {object} resource the resource to be parsed
   * @property {array} captionContent what to display as caption
   * @property {number} figureNumber in static mode, the number of the figure
   */
  static propTypes = {
    schematype: PropTypes.string,
    resource: PropTypes.object.isRequired,
    captionContent: PropTypes.array,
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
        text: this.props.resource.url
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
              resource={'#' + this.props.resource.citeKey}
              id={'peritext-figure-' + this.props.id}
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
                Figure {this.props.figureNumber} – {renderContents(this.props.captionContent)} – <StructuredHyperLink contents={contents} resource={this.props.resource}/>
              </figcaption>
            </figure>
          );
  }
}
