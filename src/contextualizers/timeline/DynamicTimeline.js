import React, {PropTypes} from 'react';

import renderContents from './../../core/utils/componentsFactory';

import mapData from './mapData';
import { timeParse } from 'd3-time-format';

/**
 * dumb static-oriented component for displaying a table
 */
export default class DynamicTimeline extends React.Component {
  /**
   * propTypes
   * @property {string} schematype - html schema type of the element
   * @property {array} resources - array of resources used
   * @property {string} captionContent - what to display as caption
   * @property {number} figureNumber - in static mode, the number of the figure
   * @property {object} data - the resource dataset(s) to use (several if several resources involved)
   * @property {string} id - the id to use for identifying the contextualization
   */
  static propTypes = {
    captionContent: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.string
    ]),
    schematype: PropTypes.string,
    resources: PropTypes.array,
    datasets: PropTypes.object,
    contextualization: PropTypes.object,
    id: PropTypes.string
  };

  static defaultProps = {
    schematype: 'Dataset',
    comment: ''
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    if (!this.props.datasets) {
      return <span>No data (yet ?)</span>;
    }
    const parseTime = timeParse(this.props.contextualization.dateformat);
    this.layers = this.props.contextualization.layer
                .map(layer =>
                  // resolve data accessors
                  mapData(layer, this.props.resources, this.props.datasets, parseTime)
                );
    const startAt = this.props.contextualization.startat;
    const endAt = this.props.contextualization.endat;

    this.minimumDate = Infinity;
    // calculating a minimum
    this.layers.forEach(layer => {
      layer.items.forEach(item => {
        if (item.date < this.minimumDate) {
          this.minimumDate = item.date;
        }
      })
    });

    this.maximumDate = -Infinity;
    // calculating a maximum
    this.layers.forEach(layer => {
      layer.items.forEach(item => {
        if (item.date > this.maximumDate) {
          this.maximumDate = item.date;
        }
      })
    });

    if (startAt) {
      this.startAt = parseTime(startAt);
    } else {
      this.startAt = this.minimumDate;
    }
    if (endAt) {
      this.endAt = parseTime(endAt);
    } else {
      this.endAt = this.maximumDate;
    }
    console.log('minimum', this.minimumDate, 'start', this.startAt);
    return (
            <figure
              role="group"
              className="peritext-dynamic-timeline-container peritext-figure-container"
              itemScope
              itemProp="citation"
              itemType={'http://schema.org/' + this.props.schematype}
              typeof={this.props.schematype}
              id={'peritext-figure-' + this.props.id}
            >
              <section className="visualizations-container">
                <div className="mini-timeline-container">
                  <div
                    className="mini-timeline-block"
                    style={{
                      top: (this.startAt - this.minimumDate) / (this.maximumDate - this.minimumDate) * 100 + '%',
                      height: (this.endAt - this.startAt) * 100 + '%'
                    }}
                  />
                  {this.layers.map((layer, index) => {
                      return layer.items
                      .map((item, index2) => {
                        return (
                          <div
                            className="visualization-item"
                            style={{
                              top: (item.date - this.minimumDate) / (this.maximumDate - this.minimumDate) * 100 + '%'
                            }}
                            title={item.label + ' ' + item.date.toString()}
                            key={index2}>
                          </div>
                        );
                      })
                    })}
                </div>
                <div
                  className="layers-container"
                  style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    width: '100%',
                    height: '100%'
                  }}
                >
                {
                  this.layers.map((layer, index) => (
                    <div
                      className="timeline-layer"
                      key={index}
                      style={{
                        width: (100 / this.layers.length) + '%',
                        height: '100%'
                      }}
                    >
                      <h3 className="layer-title-container">{layer.title}</h3>
                      {
                        layer.items
                        .filter(item => item.date >= this.startAt && item.date <= this.endAt)
                        .map((item, index2) => {
                          return (
                            <div
                              className="visualization-item"
                              style={{
                                top: (item.date - this.startAt) / (this.endAt - this.startAt) * 100 + '%'
                              }}
                              title={item.label + ' ' + item.date.toString()}
                              key={index2}>
                            </div>
                          );
                        })
                      }
                    </div>
                  ))
                }
                </div>
              </section>
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
