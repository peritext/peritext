import React, {PropTypes} from 'react';
import StructuredPerson from './../StructuredDataComponents/StructuredPerson.js';
import Radium from 'radium';

// let styles = {};

/**
 * dumb component for cover page of a static publication of document
 */
@Radium
export default class StaticCoverPage extends React.Component {

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
        id="modulo-contents-cover"
        className="modulo-contents-cover"
      >
        <div
          style={{backgroundImage: 'url(' + this.getGeneralProp(this.props.metadata, 'coverimage') + ')'}}
          id="modulo-contents-cover-image-container"
        ></div>
        <div
          className="modulo-contents-cover-texts-container"
        >
          <section className="modulo-contents-cover-part-top-left">
            <h3 className="modulo-contents-cover-dissertationinstitution">
              Thèse / {this.getGeneralProp(this.props.metadata, 'dissertationinstitution')}
            </h3>
            <p>
              Pour obtenir le grade de DOCTEUR
            </p>
            <h4 className="modulo-contents-cover-dissertationcomment">
              {this.getGeneralProp(this.props.metadata, 'dissertationcomment')}
            </h4>

            <p className="modulo-contents-cover-dissertationdoctoralschool">
              École doctorale {this.getGeneralProp(this.props.metadata, 'dissertationdoctoralschool')}
            </p>

            <p className="modulo-contents-cover-dissertationdiscipline">
              Mention : <span>{this.getGeneralProp(this.props.metadata, 'dissertationdiscipline')}</span>
            </p>
          </section>

          <section className="modulo-contents-cover-part-top-right">
            <p>
              présentée par
            </p>
            <h1 className="modulo-contents-authors">
              {this.getGeneralProp(this.props.metadata, 'author').map((person) =>{
                return <StructuredPerson key={person.citeKey} resource={person}/>;
              })}
            </h1>
            <p className="modulo-contents-cover-dissertationlab">
              {this.getGeneralProp(this.props.metadata, 'dissertationlab')}
            </p>
          </section>

          <section className="modulo-contents-cover-part-bottom-left">
            <h1>
              {this.getGeneralProp(this.props.metadata, 'title')}
            </h1>
          </section>

          <section className="modulo-contents-cover-part-bottom-right">
            <p className="modulo-contents-cover-date">
              Thèse soutenue le {this.getGeneralProp(this.props.metadata, 'date')}
            </p>
            <p>
              devant le jury composé de :
            </p>
            {
              this.getGeneralProp(this.props.metadata, 'dissertationjury').map((person) =>{
                return (
                    <p key={person.citeKey} className="modulo-contents-cover-jury-member">
                      <StructuredPerson resource={person} pattern="${firstName} ${lastName:capitals} <br/>${information} / ${role}"/>
                    </p>
                  );
              })
            }
          </section>
        </div>
      </section>
    );
  }
}
