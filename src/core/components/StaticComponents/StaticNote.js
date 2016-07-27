import React, {PropTypes} from 'react';
import HtmlToReact from 'html-to-react';

import Radium from 'radium';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a static note
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
    const content = this.htmlToReactParser.parse('<span class="peritext-static-note-content-content">' + this.props.noteContent + '</span>');
    return (
      <p
        className="peritext-static-note-content-container"
        name={'peritext-static-note-content-' + this.props.sectionCiteKey + this.props.notesCount}
        id={'peritext-static-note-content-' + this.props.sectionCiteKey + this.props.notesCount}
      >
        <a
          href={'#peritext-static-note-content-' + this.props.sectionCiteKey + this.props.notesCount}
          className="peritext-static-note-content-number"
        >
          <span>{this.props.notesCount}</span>
        </a>
        {content}
      </p>
    );
  }
}
