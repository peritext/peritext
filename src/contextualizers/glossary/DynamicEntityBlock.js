import React, {PropTypes} from 'react';
import {bibToSchema} from './../../core/utils/microDataUtils';

/**
 * dumb component and placeholder for rendering the structured representation of an resource long citation (in a glossary for example)
 */
export default class DynamicEntityBlock extends React.Component {

  /**
   * propTypes
   * @property {object} resource - the resource resource to contextualize
   * @property {object} contextualizer - the contextualizer params to use for contextualization
   * @property {object} contextualization - the contextualization object
   * @property {object} settings - the set of settings to use for rendering
   */
  static propTypes = {
    resources: PropTypes.array,
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
    const entity = this.props.resources[0];
    const itemType = bibToSchema(entity.bibType);
    return (
      <section
        className="peritext-static-resource-block-container"
        name={'peritext-static-resource-block-' + entity.id}
        id={'peritext-static-resource-block-' + entity.id}
        itemProp="mentions"
        value="mentions"
        itemScope
        itemType={'http://schema.org/' + itemType}
        typeof={itemType}
        resource={entity.id}
      >
        <h5
          className="peritext-static-resource-block-name">
          {itemType === 'Person' ?
            [<span
              itemProp="familyName"
              property="familyName"
              key="familyName"
            >{entity.lastname}</span>,
            <span key="separator1"> (</span>,
            <span
              itemProp="givenName"
              property="givenName"
              key="givenName"
            >{entity.firstname}</span>,
            <span key="separator2">)</span>]
            :
            <span
              property="name"
              itemProp="name"
            >{entity.name}</span>
          }
        </h5>

        {entity.description && entity.showdescription === 'yes' ?
          <p className="peritext-static-resource-block-description">
            {entity.description}
          </p>
          : ''}
      </section>
    );
  }
}
