import React, {PropTypes} from 'react';
import {bibToSchema} from './../../core/utils/microDataUtils';

/**
 * dumb component and placeholder for rendering the structured representation of an entity long citation (in a glossary for example)
 */
export default class DynamicEntityBlock extends React.Component {

  /**
   * propTypes
   * @property {object} entity - the entity resource to contextualize
   * @property {object} contextualizer - the contextualizer params to use for contextualization
   * @property {object} contextualization - the contextualization object
   * @property {object} settings - the set of settings to use for rendering
   */
  static propTypes = {
    entity: PropTypes.object,
    contextualizer: PropTypes.object,
    contextualization: PropTypes.object,
    settings: PropTypes.object
  };

  static defaultProps = {
    contextualizer: {
      showdescription: 'yes'
    }
  };

  /**
   * render component
   * @return {ReactElement} markup
   */
  render() {
    const itemType = bibToSchema(this.props.entity.bibType);
    return (
      <section
        className="peritext-static-entity-block-container"
        name={'peritext-static-entity-block-' + this.props.entity.id}
        id={'peritext-static-entity-block-' + this.props.entity.id}
        itemProp="mentions"
        value="mentions"
        itemScope
        itemType={'http://schema.org/' + itemType}
        typeof={itemType}
        resource={this.props.entity.id}
      >
        <h5
          className="peritext-static-entity-block-name">
          {itemType === 'Person' ?
            [<span
              itemProp="familyName"
              property="familyName"
              key="familyName"
            >{this.props.entity.lastname}</span>,
            <span key="separator1"> (</span>,
            <span
              itemProp="givenName"
              property="givenName"
              key="givenName"
            >{this.props.entity.firstname}</span>,
            <span key="separator2">)</span>]
            :
            <span
              property="name"
              itemProp="name"
            >{this.props.entity.name}</span>
          }
        </h5>

        {this.props.entity.description && this.props.contextualizer.showdescription === 'yes' ?
          <p className="peritext-static-entity-block-description">
            {this.props.entity.description}
          </p>
          : ''}
      </section>
    );
  }
}
