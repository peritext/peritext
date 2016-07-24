import React, {PropTypes} from 'react';
import HtmlToReact from 'html-to-react';
import Radium from 'radium';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a static section
 */
@Radium
export default class StaticNote extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    sectionCiteKey: PropTypes.string,
    notesCount: PropTypes.number,
    noteContent: PropTypes.string
  };

  static defaultProps = {
  };

  htmlToReactParser = new HtmlToReact.Parser(React);

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const content = this.htmlToReactParser.parse('<span class="modulo-contents-note-text">' + this.props.noteContent + '</span>');
    return (
      <p
        className="modulo-contents-note-content"
        name={'note-content-' + this.props.sectionCiteKey + this.props.notesCount}
        id={'note-content-' + this.props.sectionCiteKey + this.props.notesCount}
      >
        <a
          href={'#note-content-' + this.props.sectionCiteKey + this.props.notesCount}
          className="modulo-contents-note-number"
        >
          <span>{this.props.notesCount}</span>
        </a>
        {content}
      </p>
    );
  }
}
