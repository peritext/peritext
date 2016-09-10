import React, {PropTypes} from 'react';

/**
 * dumb component for displaying a simple structured image figure
 */
export default class StaticImageFigure extends React.Component {

  /**
   * propTypes
   * @property {string} schematype - html schema type of the element
   * @property {object} resource - the resource to be parsed
   * @property {string} imageKey - the resource prop to use for finding the image url
   * @property {string} captionContent - what to display as caption
   * @property {number} figureNumber - in static mode, the number of the figure
   */
  static propTypes = {
    schematype: PropTypes.string,
    resource: PropTypes.object,
    imageKey: PropTypes.string,
    captionContent: PropTypes.array,
    figureNumber: PropTypes.number
  };

  static defaultProps = {
    schematype: 'ImageObject',
    captionContent: [],
    imageKey: 'imageurl'
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
              <figure
                className="peritext-static-image-figure-container"
                itemProp="image"
                value="image"
                itemScope
                itemType="http://schema.org/ImageObject"
                typeof="ImageObject"
              >
                <a
                  href={this.props.resource[this.props.imageKey]}
                  itemProp="url"
                  property="url"
                  value={this.props.resource[this.props.imageKey]}
                >
                </a>
                <img
                  itemProp="contentUrl"
                  value="contentUrl"
                  src={this.props.resource[this.props.imageKey]}
                  alt={this.props.resource.title}
                />
              </figure>
          );
  }
}
