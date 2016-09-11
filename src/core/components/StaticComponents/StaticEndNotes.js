import React, {PropTypes} from 'react';
import {StaticNoteContent} from '../index';
import { intlShape, defineMessages } from 'react-intl';


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
class StaticEndNotes extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    notes: PropTypes.array,
    classSuffix: PropTypes.string,
    id: PropTypes.id
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
        id={this.props.id}
      >
        {this.props.notes.length > 0 ? <h4 className="peritext-static-end-notes-title">
         { formatMessage(translate.endnotes, {}) }
        </h4> : ''}

        <div className="peritext-static-end-notes-notes-container">
          {this.props.notes.map((note, noteIndex)=> {
            return <StaticNoteContent key={noteIndex} note={note} />;
          })}
        </div>
      </section>
    );
  }
}

StaticEndNotes.contextTypes = { intl: intlShape };

export default StaticEndNotes;
