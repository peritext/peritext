import React, {PropTypes} from 'react';

import {
  StructuredPerson
} from '../index';

/**
 * dumb component for back cover page of a static publication of document
 */
export default class StaticBackCover extends React.Component {

  /**
   * propTypes
   * @property {Object} metadata - a section metadata to parse in order to fill cover template
   */
  static propTypes = {
    metadata: PropTypes.object
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <section
        id="peritext-static-back-cover"
        className="peritext-static-back-cover-container"
      >
        <h2>{(this.props.metadata.general.title && this.props.metadata.general.title.value)}</h2>
        <h3 className="peritext-static-authors">
          {(this.props.metadata.general.author.value).map((person) =>{
            return <StructuredPerson key={person.citeKey} resource={person}/>;
          })}
        </h3>
        <p>
          {(this.props.metadata.general.abstract && this.props.metadata.general.abstract.value)}
        </p>
      </section>
    );
  }
}
