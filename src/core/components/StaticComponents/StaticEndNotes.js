import React, {PropTypes} from 'react';
import Radium from 'radium';
import {StaticNote} from './../index.js';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a static section
 */
@Radium
export default class StaticEndNotes extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    notes: PropTypes.array,
    classSuffix: PropTypes.string
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <section
        className={'peritext-contents-notes peritext-contents-notes-' + this.props.classSuffix}
      >
        {this.props.notes.length > 0 ? <h4 className="peritext-contents-notes-title">Notes</h4> : ''}

        <div className="peritext-contents-notes-container">
          {this.props.notes.map((note, noteIndex)=> {
            return <StaticNote key={noteIndex} sectionCitekey={note.sectionCitekey} notesCount={note.notesCount} noteContent={note.noteContent} />;
          })}
        </div>
      </section>
    );
  }
}
