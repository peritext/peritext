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
        className={'peritext-static-end-notes-container peritext-static-end-notes-' + this.props.classSuffix + '-container'}
        id={this.props.classSuffix === 'document-end' ? 'peritext-static-end-notes-document-end' : ''}
      >
        {this.props.notes.length > 0 ? <h4 className="peritext-static-end-notes-title">
         { formatMessage(translate.endnotes, {}) }
        </h4> : ''}

        <div className="peritext-static-end-notes-container">
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
