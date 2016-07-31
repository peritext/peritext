import React, {PropTypes} from 'react';
import {StaticImageFigure} from './../../core/components';
// let styles = {};

import renderContents from './../../core/utils/componentsFactory';
import Radium from 'radium';

/**
 * dumb static-oriented component for displaying an image gallery
 */
@Radium
export default class StaticImageGallery extends React.Component {
  /**
   * propTypes
   * @property {string} schematype - html schema type of the element
   * @property {array} resources - array of resources used
   * @property {string} captionContent - what to display as caption
   * @property {number} figureNumber - in static mode, the number of the figure
   * @property {string} id - the id to use in order to label the figure
   */
  static propTypes = {
    schematype: PropTypes.string,
    resources: PropTypes.array,
    captionContent: PropTypes.array,
    figureNumber: PropTypes.number,
    id: PropTypes.string
  };

  static defaultProps = {
    schematype: 'ImageGallery',
    comment: ''
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
            <figure
              role="group"
              className="peritext-static-image-gallery-container peritext-figure-container"
              itemScope
              itemProp="citation"
              itemType={'http://schema.org/' + this.props.schematype}
              typeof={this.props.schematype}
              resource={this.props.figureNumber ? 'peritext-figure-' + this.props.figureNumber : undefined }
              id={'peritext-figure-' + this.props.id}
            >
              <div className="peritext-static-image-gallery-figures-wrapper">
                {this.props.resources.map((resource)=>{
                  return <StaticImageFigure resource={resource} key={resource.citeKey} />;
                })}
              </div>
              <figcaption
                itemProp="description"
                property="description">
                  <span className="peritext-figure-marker">
                    Figure <span className="peritext-figure-number">{this.props.figureNumber}</span>
                  </span>
                  <span> – </span>
                  <span className="peritext-figure-caption-content">
                    {renderContents(this.props.captionContent)}
                  </span>
              </figcaption>
            </figure>
          );
  }
}
