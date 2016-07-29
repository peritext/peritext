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
    contents: PropTypes.array,
    id: PropTypes.string
  };

  static defaultProps = {
    contents: []
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
        className="peritext-static-table-of-figures-container"
      >
        <h2>{ formatMessage(translate.tableoffigures, {}) }</h2>
        <section className="peritext-static-table-of-figures-elements-container">
          {this.props.contents.map((element, index) =>{
            return (<section
                      className="peritext-static-table-of-figures-element"
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
