import React, {PropTypes} from 'react';
import Radium from 'radium';
import { intlShape, defineMessages } from 'react-intl';

// let styles = {};

const translate = defineMessages({
  tableoffigures: {
    id: 'table_of_figures',
    description: 'Table of figures title',
    defaultMessage: 'Table of figures',
  },
  figurename: {
    id: 'figure',
    description: 'Name of a figure',
    defaultMessage: 'Figure',
  }
});


/**
 * dumb component for rendering a static table of figures
 */
@Radium
class StaticTableOfFigures extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    elements: PropTypes.array,
    level: PropTypes.number
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
        id="table-of-figures"
      >
        <h2>{ formatMessage(translate.tableoffigures, {}) }</h2>
        <section className="peritext-contents-table-of-figures-contents">
          {this.props.elements.map((element, index) =>{
            return (<section
                      className="peritext-contents-table-of-figures-element"
                      key={element.id + index}>
                      <a
                        href={'#' + element.id}
                      >
                        { formatMessage(translate.figurename, {}) } {element.number}
                      </a>
                    </section>);
          })}
        </section>
      </section>
    );
  }
}

StaticTableOfFigures.contextTypes = { intl: intlShape };

export default StaticTableOfFigures;
