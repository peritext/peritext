import React, {PropTypes} from 'react';
import Radium from 'radium';
// let styles = {};
import renderContents from './../../utils/componentsFactory';

/**
 * dumb component for containing either a static or dynamic note, acting whether as a pointer or as a container
 */
@Radium
export default class StaticFootnote extends React.Component {

  /**
   * propTypes
   * @property {Object} note - the note object to use in order to render the footnote
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
        className="peritext-static-note-content-container"
        name={'peritext-static-note-content-' + this.props.note.target }
        id={'peritext-static-note-content-' + this.props.note.target}
      >
        {renderContents(this.props.note.contents)}
      </sup>);
  }
}
