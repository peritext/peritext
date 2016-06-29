import React, {PropTypes} from 'react';
import ImageFigure from './ImageFigure.jsx'
import HyperLink from './HyperLink.jsx'
import Radium from 'radium';
let styles = {};

/**
 * dumb static-oriented component for displaying an image gallery
 */
@Radium
export default class ImageGallery extends React.Component {
  /**
   * propTypes
   * @property {string} schematype html schema type of the element
   * @property {array} resources array of resources used
   * @property {string} captionContent what to display as caption
   * @property {number} figureNumber in static mode, the number of the figure
   */
  static propTypes = {
    schematype: PropTypes.string,
    resources: PropTypes.array,
    captionContent: PropTypes.string,
    figureNumber: PropTypes.number
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
    const invisibleStyle = {
      display: 'none'
    }
    return (
            <figure
              role="group"
              className="modulo-contents-figures-gallery modulo-contents-figure"
              itemScope
              itemProp="citation"
              itemType={'http://schema.org/' + this.props.schematype}
              typeof={this.props.schematype}
              resource={this.props.figureNumber ? 'modulo-contents-figure-' + this.props.figureNumber : undefined }
              id={this.props.figureNumber ? 'modulo-contents-figure-' + this.props.figureNumber : undefined }
            >
              <div className="modulo-contents-figures-wrapper">
                {this.props.resources.map((resource)=>{
                  return <ImageFigure resource={resource} key={resource.citeKey} />;
                })}
              </div>
              <figcaption
                itemProp="caption"
                property="caption"
              >
                Figure {this.props.figureNumber} – {this.props.captionContent}
              </figcaption>
            </figure>
          );
  }
}
