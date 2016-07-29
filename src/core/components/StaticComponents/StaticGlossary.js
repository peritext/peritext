import React, {PropTypes} from 'react';
import Radium from 'radium';
import { intlShape, defineMessages } from 'react-intl';
import StaticEntityBlock from './../../../contextualizers/glossary/StaticEntityBlock.js';
// let styles = {};

const translate = defineMessages({
  glossary: {
    id: 'glossary',
    description: 'Title of glossary section',
    defaultMessage: 'Glossary',
  }
});

/**
 * dumb component for rendering a static table of contents
 */
@Radium
class StaticGlossary extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    elements: PropTypes.array,
    id: PropTypes.string
  };

  static defaultProps = {
    elements: []
  };


  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const { formatMessage } = this.context.intl;
    return (
      <section
        id={this.props.id}
        className="peritext-static-glossary-container"
      >
        <h2>{ formatMessage(translate.glossary, {}) }</h2>
        <section
          className="peritext-static-glossary-elements-container"
        >
          {
            this.props.elements.map((entity, index) => (
              <StaticEntityBlock key={index} entity={entity} />
            ))
          }
        </section>
      </section>
    );
  }
}
StaticGlossary.contextTypes = { intl: intlShape };

export default StaticGlossary;
