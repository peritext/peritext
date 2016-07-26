import React, {PropTypes} from 'react';
import Radium from 'radium';

import {bibToSchema} from './../../utils/microDataUtils';
// let styles = {};

/**
 * dumb component and placeholder for rendering the structured representation of an entity citation
 */
@Radium
export default class StaticEntityInline extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    entity: PropTypes.object,
    sectionCiteKey: PropTypes.string,
    contextualization: PropTypes.object,
    textContent: PropTypes.string
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const itemType = bibToSchema(this.props.entity.bibType);
    return (
      <a
        className="peritext-contents-entity-container-inline"
        name={'peritext-content-entity-inline-' + this.props.sectionCiteKey + '-' + this.props.contextualization.citeKey}
        id={'peritext-content-entity-inline-' + this.props.sectionCiteKey + '-' + this.props.contextualization.citeKey}
        href={'#peritext-content-entity-block-' + this.props.entity.citeKey}
        itemProp="mentions"
        value="mentions"
        itemScope
        itemType={'http://schema.org/' + itemType}
        typeof={itemType}
        resource={this.props.entity.citeKey}
      >
        {itemType === 'Person' ?
          [<span
            style={{display: 'none'}}
            itemProp="givenName"
            property="givenName"
            key="givenName"
          >{this.props.entity.firstname}</span>,
          <span
            style={{display: 'none'}}
            itemProp="familyName"
            property="familyName"
            key="familyName"
          >{this.props.entity.lastname}</span>]
          :
          <span
            style={{display: 'none'}}
            property="name"
            itemProp="name"
          >{this.props.entity.name}</span>
        }
        <span>{this.props.textContent}</span>
      </a>
    );
  }
}
