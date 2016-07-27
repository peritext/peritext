import React, {PropTypes} from 'react';
import reactStringReplace from 'react-string-replace';

import Radium from 'radium';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a person
 */
@Radium
export default class StructuredPerson extends React.Component {

  /**
   * propTypes
   * @property {object} resource the person object which may contain the following props : "lastName", "firstName", "role", and "information"
   * @property {string} pattern the pattern to apply for formatting the person name to html, eg : " ${lastName:capitals}, ${firstName:initials}"
   * @property {string} property the microformat property to apply to the structured element
   */
  static propTypes = {
    resource: PropTypes.object,
    pattern: PropTypes.string,
    property: PropTypes.string
  };

  static defaultProps = {
    pattern: '${firstName} ${lastName}',
    property: 'author'
  };

  /**
   * transformValues modifies firstName and lastName according to pattern indications
   * @return {Object}
   */
  transformValues(author, pattern) {
    const vals = Object.assign({}, author);
    // catch format transformers
    const transformFirstNameMatch = pattern.match(/(\${firstName(:[^}]*)?})/);
    const transformLastNameMatch = pattern.match(/(\${lastName(:[^}]*)?})/);
    // if transformers - transform
    if (transformFirstNameMatch) {
      if (transformFirstNameMatch[2] === ':initials') {
        // processing composed names (e.g. Gian-Marco Patalucci)
        let initials = vals.firstName.split('-').map((term)=>{
          if (term.length > 0) {
            return term.toUpperCase().substr(0, 1) + '.';
          }
          return term;
        }).join('-');
        // processing multiple names (e.g. Donald Ronald Romuald Ronaldo Reagan)
        initials = vals.firstName.split(' ').map((term)=>{
          if (term.length > 0) {
            return term.toUpperCase().substr(0, 1) + '.';
          }
          return term;
        }).join(' ');
        vals.firstName = initials;
      }
    }
    if (transformLastNameMatch) {
      if (transformLastNameMatch[2] === ':capitals') {
        vals.lastName = vals.lastName.toUpperCase();
      }
    }
    return vals;
  }

  /**
   * updateHtml : transform pattern+person props into a react element
   * @return {ReactElement} markup
   */
  updateHtml() {
    const vals = this.transformValues(this.props.resource, this.props.pattern);

    const firstNameExp = this.props.pattern.match(/(\${firstName(:[^}]*)?})/);
    const lastNameExp = this.props.pattern.match(/(\${lastName(:[^}]*)?})/);
    let replacedText = this.props.pattern;
    if (firstNameExp) {
      replacedText = reactStringReplace(replacedText, new RegExp('(\\' + firstNameExp[0] + ')', 'g'), (match, index)=> (
        <span key={match + index} className="peritext-structured-person-firstname" itemProp="givenName" property="givenName" >{vals.firstName}</span>
      ));
    }

    if (lastNameExp) {
      replacedText = reactStringReplace(replacedText, new RegExp('(\\' + lastNameExp[0] + ')', 'g'), (match, index)=> (
        <span key={match + index} className="peritext-structured-person-lastname" itemProp="familyName" property="familyName" >{vals.lastName}</span>
      ));
    }

    replacedText = reactStringReplace(replacedText, /(\${role})/g, (match, index)=> (
      <span key={match + index} className="peritext-structured-person-role" >{vals.role}</span>
    ));

    if (vals.information) {
      replacedText = reactStringReplace(replacedText, /(\${information})/g, (match, index)=> (
        <span key={match + index} className="peritext-structured-person-information" >{vals.information}</span>
      ));
    }

    return replacedText;
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <span
        className="peritext-structured-person-container"
        itemProp={this.props.property}
        itemScope
        itemType="http://schema.org/Person"
        property={this.props.property}
        typeof="Person"
        resource={this.props.resource.citeKey}
      >
        {this.updateHtml()}
      </span>
    );
  }
}
