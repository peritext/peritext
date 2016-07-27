import React, {PropTypes} from 'react';
import Radium from 'radium';

import {bibToSchema} from './../../utils/microDataUtils';
// let styles = {};


/**
 * dumb component and placeholder for rendering the structured representation of an entity citation
 */
@Radium
export default class StaticEntityBlock extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    entity: PropTypes.object,
    contextualizer: PropTypes.object,
    settings: PropTypes.object
  };

  static defaultProps = {
    contextualizer: {
      showdescription: 'yes'
    }
  };

  renderMentions() {
    const self = this;
    return Object.keys(this.props.entity.aliases).map(function(alias, aliasIndex) {
      return (<p key={alias} className="peritext-static-entity-block-page-mentions-container">
        <span>{alias === 'no-alias' ? '' : alias + ' : '}</span>
        {self.props.entity.aliases[alias].map((entry, index)=> {
          return (<span key={entry.mentionId}>
              p. <a className="peritext-static-entity-block-page-pointer" href={entry.mentionId}></a>
            </span>);
        }).reduce((accu, elem) => {
          return accu === null ? [elem] : [...accu, ', ', elem];
        }, null)}
      </p>);
    });
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const itemType = bibToSchema(this.props.entity.bibType);
    return (
      <section
        className="peritext-static-entity-block-container"
        name={'peritext-static-entity-block-' + this.props.entity.citeKey}
        id={'peritext-static-entity-block-' + this.props.entity.citeKey}
        itemProp="mentions"
        value="mentions"
        itemScope
        itemType={'http://schema.org/' + itemType}
        typeof={itemType}
        resource={this.props.entity.citeKey}
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

        {this.props.entity.aliases ?
            this.renderMentions()
            : ''}

        {this.props.entity.description && this.props.contextualizer.showdescription === 'yes' ?
          <p className="peritext-static-entity-block-description">
            {this.props.entity.description}
          </p>
          : ''}
      </section>
    );
  }
}
