import React, {PropTypes} from 'react';
import Radium from 'radium';

/**
 * dumb component for rendering the structured representation of a static note pointer
 */
@Radium
export default class StaticNotePointer extends React.Component {

  /**
   * propTypes
   * @property {Object} note - the note object to use in order to render the note pointer
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
      <sup
        className="peritext-static-note-pointer-container"
        name={'peritext-static-note-pointer-' + this.props.note.id}
        id={'peritext-static-note-pointer-' + this.props.note.id}
      >
        <a
          href={'#peritext-static-note-content-' + this.props.note.id}
          className="peritext-static-note-pointer-number"
        >
          {this.props.note.noteNumber}
        </a>
      </sup>
    );
  }
}
