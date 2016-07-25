import React, {PropTypes} from 'react';
import Radium from 'radium';
import {StaticNote} from './../index.js';
import { intlShape, defineMessages } from 'react-intl';

// let styles = {};

const translate = defineMessages({
  endnotes: {
    id: 'end_notes',
    description: 'Title of the endnotes',
    defaultMessage: 'Notes',
  }
});


/**
 * dumb component for rendering the structured representation of a static section
 */
@Radium
class StaticEndNotes extends React.Component {

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
    const { formatMessage } = this.context.intl;
    return (
      <section
        className={'peritext-contents-notes peritext-contents-notes-' + this.props.classSuffix}
      >
        {this.props.notes.length > 0 ? <h4 className="peritext-contents-notes-title">
         { formatMessage(translate.endnotes, {}) }
        </h4> : ''}

        <div className="peritext-contents-notes-container">
          {this.props.notes.map((note, noteIndex)=> {
            return <StaticNote key={noteIndex} sectionCitekey={note.sectionCitekey} notesCount={note.notesCount} noteContent={note.noteContent} />;
          })}
        </div>
      </section>
    );
  }
}

StaticEndNotes.contextTypes = { intl: intlShape };

export default StaticEndNotes;
