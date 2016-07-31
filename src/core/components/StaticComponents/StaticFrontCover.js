import React, {PropTypes} from 'react';
import StructuredPerson from './../StructuredDataComponents/StructuredPerson.js';
import Radium from 'radium';

/**
 * dumb component for cover page of a static publication of document
 */
@Radium
export default class StaticFrontCover extends React.Component {

  /**
   * propTypes
   * @property {array} metadata a section metadata to parse in order to fill cover template
   */
  static propTypes = {
    metadata: PropTypes.array
  };

  static defaultProps = {
  };

  /**
   * Util for returning the value of a "general" type metadata
   * @param {array} list - the list of metadata
   * @param {string} key - the key of the metadata prop
   * @return {string} value
   */
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
        id="peritext-static-front-cover"
        className="peritext-static-front-cover-container"
      >
        <div
          style={{backgroundImage: 'url(' + this.getGeneralProp(this.props.metadata, 'coverimage') + ')'}}
          id="peritext-static-front-cover-image-container"
        ></div>
        <div
          className="peritext-static-front-cover-texts-container"
        >
          <section className="peritext-static-front-cover-part-top-left">
            <h3 className="peritext-static-front-cover-dissertationinstitution">
              Thèse / {this.getGeneralProp(this.props.metadata, 'dissertationinstitution')}
            </h3>
            <p>
              Pour obtenir le grade de DOCTEUR
            </p>
            <h4 className="peritext-static-front-cover-dissertationcomment">
              {this.getGeneralProp(this.props.metadata, 'dissertationcomment')}
            </h4>

            <p className="peritext-static-front-cover-dissertationdoctoralschool">
              École doctorale {this.getGeneralProp(this.props.metadata, 'dissertationdoctoralschool')}
            </p>

            <p className="peritext-static-front-cover-dissertationdiscipline">
              Mention : <span>{this.getGeneralProp(this.props.metadata, 'dissertationdiscipline')}</span>
            </p>
          </section>

          <section className="peritext-static-front-cover-part-top-right">
            <p>
              présentée par
            </p>
            <h1 className="peritext-static-authors">
              {this.getGeneralProp(this.props.metadata, 'author').map((person) =>{
                return <StructuredPerson key={person.citeKey} resource={person}/>;
              })}
            </h1>
            <p className="peritext-static-front-cover-dissertationlab">
              {this.getGeneralProp(this.props.metadata, 'dissertationlab')}
            </p>
          </section>

          <section className="peritext-static-front-cover-part-bottom-left">
            <h1>
              {this.getGeneralProp(this.props.metadata, 'title')}
            </h1>
          </section>

          <section className="peritext-static-front-cover-part-bottom-right">
            <p className="peritext-static-front-cover-date">
              Thèse soutenue le {this.getGeneralProp(this.props.metadata, 'date')}
            </p>
            <p>
              devant le jury composé de :
            </p>
            {
              this.getGeneralProp(this.props.metadata, 'dissertationjury').map((person) =>{
                return (
                    <p key={person.citeKey} className="peritext-static-front-cover-jury-member">
                      <StructuredPerson resource={person} pattern="${firstName} ${lastName:capitals} ${information} / ${role}"/>
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
