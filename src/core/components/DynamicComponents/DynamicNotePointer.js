import React, {PropTypes} from 'react';

/**
 * dumb component for rendering the structured representation of a static note pointer
 */
export default class DynamicNotePointer extends React.Component {

  /**
   * propTypes
   * @property {Object} note - the note object to use in order to render the note pointer
   */
  static propTypes = {
    note: PropTypes.object
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
        className="peritext-dynamic-note-pointer-container"
        name={'peritext-dynamic-note-pointer-' + this.props.note.id}
        id={'peritext-dynamic-note-pointer-' + this.props.note.id}
      >
        <span
          className="peritext-dynamic-note-pointer-number"
        >
          {this.props.note.noteNumber}
        </span>
      </sup>
    );
  }
}
