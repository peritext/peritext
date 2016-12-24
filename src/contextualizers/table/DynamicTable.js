import React, {PropTypes} from 'react';
import renderContents from './../../core/utils/componentsFactory';


/**
 * dumb static-oriented component for displaying a table
 */
export default class DynamicTable extends React.Component {
  /**
   * propTypes
   * @property {string} schematype - html schema type of the element
   * @property {array} resources - array of resources used
   * @property {string} captionContent - what to display as caption
   * @property {number} figureNumber - in static mode, the number of the figure
   * @property {object} data - the resource data to use
   * @property {string} id - the id to use for identifying the contextualization
   */
  static propTypes = {
    schematype: PropTypes.string,
    resources: PropTypes.array,
    captionContent: PropTypes.array,
    data: PropTypes.object,
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
    if (!this.props.data || !this.props.data.data || !this.props.data.data.length) {
      return <span>No data</span>;
    }
    const headers = Object.keys(this.props.data.data[0]);
    const objects = this.props.data.data;
    return (
            <figure
              role="group"
              className="peritext-static-table-container peritext-figure-container"
              itemScope
              itemProp="citation"
              itemType={'http://schema.org/' + this.props.schematype}
              typeof={this.props.schematype}
              resource={this.props.figureNumber ? 'peritext-figure-' + this.props.figureNumber : undefined }
              id={'peritext-figure-' + this.props.id}
            >
              <table className="peritext-static-table-table">
                <thead>
                  <tr>
                    {headers.map((header, index)=>{
                      return <th key={index}>{header}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {objects.map((object, oIndex)=>{
                    return (<tr key={oIndex}>
                      {headers.map((header, hIndex)=>{
                        return <th key={hIndex}>{object[header]}</th>;
                      })}
                    </tr>);
                  })}
                </tbody>
              </table>
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
