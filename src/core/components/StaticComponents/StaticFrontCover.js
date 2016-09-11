import React, {PropTypes} from 'react';
import StructuredPerson from '../StructuredDataComponents/StructuredPerson';

/**
 * dumb component for cover page of a static publication of document
 */
export default class StaticFrontCover extends React.Component {

  /**
   * propTypes
   * @property {Object} metadata a section metadata to parse in order to fill cover template
   */
  static propTypes = {
    metadata: PropTypes.object
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const bibType = this.props.metadata.general.bibType.value;
    if (bibType !== 'peritextphdthesis') {
      return (
        <section
        id="peritext-static-front-cover"
        className="peritext-static-front-cover-container"
        >
          <h1>{this.props.metadata.general.title && this.props.metadata.general.title.value}</h1>
          <h2 className="peritext-static-authors">
            {this.props.metadata.general.author.value.map((person) =>{
              return <StructuredPerson key={person.citeKey} resource={person}/>;
            })}
          </h2>
        </section>
        )
    }
    return (
      <section
        id="peritext-static-front-cover"
        className="peritext-static-front-cover-container"
      >
        <div
          style={{backgroundImage: 'url(' + (this.props.metadata.general.coverimage && this.props.metadata.general.coverimage.value) + ')'}}
          id="peritext-static-front-cover-image-container"
        ></div>
        <div
          className="peritext-static-front-cover-texts-container"
        >
          <section className="peritext-static-front-cover-part-top-left">
            <h3 className="peritext-static-front-cover-dissertationinstitution">
              Thèse / {(this.props.metadata.general.dissertationinstitution && this.props.metadata.general.dissertationinstitution.value)}
            </h3>
            <p>
              Pour obtenir le grade de DOCTEUR
            </p>
            <h4 className="peritext-static-front-cover-dissertationcomment">
              {(this.props.metadata.general.dissertationcomment && this.props.metadata.general.dissertationcomment.value)}
            </h4>

            <p className="peritext-static-front-cover-dissertationdoctoralschool">
              École doctorale {(this.props.metadata.general.dissertationdoctoralschool && this.props.metadata.general.dissertationdoctoralschool.value)}
            </p>

            <p className="peritext-static-front-cover-dissertationdiscipline">
              Mention : <span>{(this.props.metadata.general.dissertationdiscipline && this.props.metadata.general.dissertationdiscipline.value)}</span>
            </p>
          </section>

          <section className="peritext-static-front-cover-part-top-right">
            <p>
              présentée par
            </p>
            <h1 className="peritext-static-authors">
              {this.props.metadata.general.author.value.map((person) =>{
                return <StructuredPerson key={person.citeKey} resource={person}/>;
              })}
            </h1>
            <p className="peritext-static-front-cover-dissertationlab">
              {(this.props.metadata.general.dissertationlab && this.props.metadata.general.dissertationlab.value)}
            </p>
          </section>

          <section className="peritext-static-front-cover-part-bottom-left">
            <h1>
              {(this.props.metadata.general.title && this.props.metadata.general.title.value)}
            </h1>
          </section>

          <section className="peritext-static-front-cover-part-bottom-right">
            <p className="peritext-static-front-cover-date">
              Thèse soutenue le {(this.props.metadata.general.date && this.props.metadata.general.date.value)}
            </p>
            <p>
              devant le jury composé de :
            </p>
            {
              (this.props.metadata.general.dissertationjury.value).map((person) =>{
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
