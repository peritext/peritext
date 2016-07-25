import React, {PropTypes} from 'react';
import Radium from 'radium';

// let styles = {};

/**
 * dumb component for back cover page of a static publication of document
 */
@Radium
export default class StaticBackCover extends React.Component {

  /**
   * propTypes
   * @property {array} metadata a section metadata to parse in order to fill cover template
   */
  static propTypes = {
    metadata: PropTypes.array
  };

  static defaultProps = {
  };

  getGeneralProp(list, key) {
    const obj = list.find((meta) => {
      return meta.domain === 'general' && meta.key === key;
    });
    if (obj) {
      return obj.value;
    }
    return undefined;
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <section
        id="peritext-contents-back-cover"
        className="peritext-contents-back-cover"
      >
        <h2>{this.getGeneralProp(this.props.metadata, 'title')}</h2>
        <p>
          {this.getGeneralProp(this.props.metadata, 'abstract')}
        </p>
      </section>
    );
  }
}
