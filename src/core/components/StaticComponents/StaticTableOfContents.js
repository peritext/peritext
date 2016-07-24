import React, {PropTypes} from 'react';
import Radium from 'radium';

// let styles = {};

/**
 * dumb component for rendering a static table of contents
 */
@Radium
export default class StaticTableOfContents extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    title: PropTypes.string,
    elements: PropTypes.array,
    level: PropTypes.number
  };

  static defaultProps = {
    title: 'Table of contents'
  };


  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <section
        id="toc"
      >
        <h2>{this.props.title}</h2>
        <section className="peritext-contents-toc-contents">
          {this.props.elements.map((element) =>{
            return <StaticTableOfContentsElement id={element.id} key={element.id} title={element.title} level={element.level} levelDisplacement={this.props.level}/>;
          })}
        </section>
      </section>
    );
  }
}

class StaticTableOfContentsElement extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    title: PropTypes.string,
    level: PropTypes.number,
    id: PropTypes.string,
    paddingDisplacement: PropTypes.number,
    levelDisplacement: PropTypes.number
  };

  static defaultProps = {
    level: 0,
    paddingDisplacement: 0.5,
    levelDisplacement: 0
  };


  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <section
        className="peritext-contents-toc-element"
        style={{paddingLeft: (this.props.level - this.props.levelDisplacement - 1) * this.props.paddingDisplacement + 'cm'}}
      >
        <a
          href={'#' + this.props.id}
        >
          {this.props.title}
        </a>
      </section>
    );
  }
}
