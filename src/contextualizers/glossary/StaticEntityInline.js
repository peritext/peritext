import React, {PropTypes} from 'react';
import Radium from 'radium';

import {bibToSchema} from './../../core/utils/microDataUtils';
// let styles = {};
import renderContents from './../../core/utils/componentsFactory';

/**
 * dumb component and placeholder for rendering the structured representation of an entity citation
 */
@Radium
export default class StaticEntityInline extends React.Component {

  /**
   * propTypes
   * @property {object} entity - the entity resource to contextualize
   * @property {string} sectionCiteKey - the host section citeKey (used for identifying the element)
   * @property {object} contextualization - the contextualization object
   * @property {array} contents - the pseudo-dom js representation of contextualization's pointer contents
   */
  static propTypes = {
    entity: PropTypes.object,
    sectionCiteKey: PropTypes.string,
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
      <a
        className="peritext-static-entity-container-inline"
        name={'peritext-content-entity-inline-' + this.props.sectionCiteKey + '-' + this.props.contextualization.citeKey}
        id={'peritext-static-entity-inline-' + this.props.sectionCiteKey + '-' + this.props.contextualization.citeKey}
        href={'#peritext-static-entity-block-' + this.props.entity.citeKey}
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
        <span>{renderContents(this.props.contents)}</span>
      </a>
    );
  }
}
