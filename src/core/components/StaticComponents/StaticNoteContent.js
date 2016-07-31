import React, {PropTypes} from 'react';
import Radium from 'radium';

import renderContents from './../../utils/componentsFactory';


/**
 * dumb component for rendering the structured representation of a static note
 */
@Radium
export default class StaticNote extends React.Component {

  /**
   * propTypes
   * @property {Object} note - the note object to use in order to render the note content
   */
  static propTypes = {
    note: PropTypes.object,
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <span
        style={{display: 'block'}}
        className="peritext-static-note-content-container"
        name={'peritext-static-note-content-' + this.props.note.id}
        id={'peritext-static-note-content-' + this.props.note.id}
      >
        <a
          href={'#peritext-static-note-pointer-' + this.props.note.id}
          className="peritext-static-note-content-number"
        >
          {this.props.note.noteNumber}
        </a>
        {renderContents(this.props.note.contents)}
      </span>
    );
  }
}
