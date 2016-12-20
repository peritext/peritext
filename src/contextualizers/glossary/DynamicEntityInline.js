import React, {PropTypes} from 'react';

import {bibToSchema} from './../../core/utils/microDataUtils';
import renderContents from './../../core/utils/componentsFactory';

/**
 * dumb component and placeholder for rendering the structured representation of an entity citation
 */
export default class DynamicEntityInline extends React.Component {

  /**
   * propTypes
   * @property {object} entity - the entity resource to contextualize
   * @property {string} sectionId - the host section id (used for identifying the element)
   * @property {object} contextualization - the contextualization object
   * @property {array} contents - the pseudo-dom js representation of contextualization's pointer contents
   */
  static propTypes = {
    entity: PropTypes.object,
    sectionId: PropTypes.string,
    contextualization: PropTypes.object,
    contents: PropTypes.array
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
      <span
        className="peritext-static-entity-container-inline peritext-inline-contextualization"
        name={this.props.contextualization.id}
        id={this.props.contextualization.id}
        itemProp="mentions"
        value="mentions"
        itemScope
        itemType={'http://schema.org/' + itemType}
        typeof={itemType}
        resource={this.props.entity.id}
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
        {<span>{renderContents(this.props.contents)}</span>}
      </span>
    );
  }
}
