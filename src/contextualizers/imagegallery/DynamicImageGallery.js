import React, {PropTypes} from 'react';
// import {StaticImageFigure} from './../../core/components';

import ImageGallery from 'react-image-gallery';

import renderContents from './../../core/utils/componentsFactory';

/**
 * dumb dynamic-oriented component for displaying an image gallery
 */
export default class DynamicImageGallery extends React.Component {
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
    resources: PropTypes.array.isRequired,
    captionContent: PropTypes.array,
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

    const images = this.props.resources.map(resource => ({
      original: resource.imageurl,
      thumbnail: resource.imageurl
    }));
    /*
    Model : [
      {
        original: 'http://lorempixel.com/1000/600/nature/1/',
        thumbnail: 'http://lorempixel.com/250/150/nature/1/',
        originalClass: 'featured-slide',
        thumbnailClass: 'featured-thumb',
        originalAlt: 'original-alt',
        thumbnailAlt: 'thumbnail-alt',
        thumbnailLabel: 'Optional',
        description: 'Optional description...',
        srcSet: 'Optional srcset (responsive images src)',
        sizes: 'Optional sizes (image sizes relative to the breakpoint)'
      }
    ];
    */
    return (
            <figure
              role="group"
              className="peritext-dynamic-image-gallery-container peritext-figure-container"
              itemScope
              itemProp="citation"
              itemType={'http://schema.org/' + this.props.schematype}
              typeof={this.props.schematype}
              id={'peritext-figure-' + this.props.id}
            >
              <div className="peritext-dynamic-image-gallery-figures-wrapper">
                <ImageGallery items={images}/>
              </div>
              <figcaption
                itemProp="description"
                property="description">
                  <span className="peritext-figure-caption-content">
                    {renderContents(this.props.captionContent)}
                  </span>
              </figcaption>
            </figure>
          );
  }
}
