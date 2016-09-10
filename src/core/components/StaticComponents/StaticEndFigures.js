import React, {PropTypes} from 'react';
import { intlShape, defineMessages } from 'react-intl';

import renderContents from './../../utils/componentsFactory';

const translate = defineMessages({
  endfigures: {
    id: 'end_figures',
    description: 'Title of the end figures',
    defaultMessage: 'Figures',
  }
});

/**
 * dumb component for rendering the structured representation of a static section
 */
class StaticEndFigures extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    contents: PropTypes.array,
    classSuffix: PropTypes.string,
    id: PropTypes.string
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const { formatMessage } = this.context.intl;
    return (
      <section
        className={'peritext-static-end-figures-container peritext-static-end-figures-' + this.props.classSuffix + '-container'}
        id={this.props.id}
      >
        {this.props.contents.length > 0 ? <h4 className="peritext-static-end-figures-title">
         { formatMessage(translate.endfigures, {}) }
        </h4> : ''}

        <div className="peritext-static-end-figures-figures-container">
          {renderContents(this.props.contents)}
        </div>
      </section>
    );
  }
}

StaticEndFigures.contextTypes = { intl: intlShape };

export default StaticEndFigures;
