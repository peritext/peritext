import React, {PropTypes} from 'react';
import Radium from 'radium';
import { intlShape, defineMessages } from 'react-intl';

// let styles = {};

const translate = defineMessages({
  referencestitle: {
    id: 'references_title',
    description: 'Title of references/bibliography section',
    defaultMessage: 'References'
  }
});

/**
 * dumb component for rendering a static table of figures
 */
@Radium
class StaticReferencesList extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    references: PropTypes.array,
    settings: PropTypes.object,
    id: PropTypes.string
  };

  static defaultProps = {
    references: []
  };


  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const citationRenderer = require('./../../../referencers/' + this.props.settings.citationStyle + '.js');
    const BlockCitation = citationRenderer.BlockCitation;
    const { formatMessage } = this.context.intl;
    return (
      <section
        className="peritext-static-references-list-container"
        id={this.props.id}
      >
        <h2>{ formatMessage(translate.referencestitle, {}) }</h2>
        <section className="peritext-static-references-list-items-container">
          {this.props.references.map((reference)=> {
            return <BlockCitation key={reference.citeKey} resource={reference} contextualization={{}} />;
          })}
        </section>
      </section>
    );
  }
}

StaticReferencesList.contextTypes = { intl: intlShape };

export default StaticReferencesList;
