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
    renderingParams: PropTypes.object
  };

  static defaultProps = {
  };


  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const citationRenderer = require('./../../utils/citationUtils/' + this.props.renderingParams.citationStyle + '.js');
    const BlockCitation = citationRenderer.BlockCitation;
    const { formatMessage } = this.context.intl;
    return (
      <section
        className="peritext-contents-reference-list-container"
      >
        <h2>{ formatMessage(translate.referencestitle, {}) }</h2>
        <section className="peritext-contents-reference-list-items">
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
