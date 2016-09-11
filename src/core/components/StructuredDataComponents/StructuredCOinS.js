import React, {PropTypes} from 'react';
import {generateOpenUrl} from '../../utils/microDataUtils';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a cited element in the format of openUrl/Context Object in Span
 */
export default class StructuredCOinS extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    resource: PropTypes.object
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const openUrl = generateOpenUrl(this.props.resource);
    return (
      <span className="peritext-structured-context-object-in-span-container Z3988" title={openUrl}></span>
    );
  }
}
