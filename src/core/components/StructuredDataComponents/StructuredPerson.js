import React, {PropTypes} from 'react';
import HtmlToReact from 'html-to-react';

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

  htmlToReactParser = new HtmlToReact.Parser(React);

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
        // processing multiple names (e.g. Donald Ronald Romuald Reagan)
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
    vals.firstName = '<span class="peritext-contents-person-firstname" itemProp="givenName" property="givenName" >' + vals.firstName + '</span>';
    vals.lastName = '<span class="peritext-contents-person-lastname" itemProp="familyName" property="familyName" >' + vals.lastName + '</span>';
    vals.role = '<span class="peritext-contents-person-role" >' + vals.role + '</span>';
    vals.information = vals.information ? '<span class="peritext-contents-person-information" >' + vals.information + '</span>' : '';
    let htmlStr = this.props.pattern
                    .replace(/(\${firstName(:[^}]*)?})/, vals.firstName)
                    .replace(/(\${lastName(:[^}]*)?})/, vals.lastName)
                    .replace(/(\${role})/, vals.role)
                    .replace(/(\${information})/, vals.information);
    htmlStr = '<span>' + htmlStr + '</span>';

    return this.htmlToReactParser.parse(htmlStr);
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <span
        className="peritext-contents-person"
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
