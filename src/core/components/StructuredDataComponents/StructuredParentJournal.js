import React, {PropTypes} from 'react';
import ReactDOMServer from 'react-dom/server';
import HtmlToReact from 'html-to-react';
import {
  StructuredDate
  // , StructuredSpan
} from './../index.js';

import Radium from 'radium';

// let styles = {};

/**
 * dumb component for rendering the structured representation of publisher information
 */
@Radium
export default class StructuredParentJournal extends React.Component {

  /**
   * propTypes
   * @property {object} resource the resource parsed for structuring data
   * @property {string} pattern the pattern to apply for formatting thresource
   * @property {string} property the microformat property to apply to the structured element
   */
  static propTypes = {
    resource: PropTypes.object,
    pattern: PropTypes.string,
    property: PropTypes.string
  };

  static defaultProps = {
    pattern: '${journal}, ${date}, ${volume}(${issue}). ISSN : ${issn}',
    property: 'isPartOf'
  };

  htmlToReactParser = new HtmlToReact.Parser(React);

  formatSimpleProp(object, objectKey, propName, tagType = 'span', subTag = '') {
    if (object[objectKey]) {
      return '<'
      + tagType
      + ' class="peritext-contents-citation-' + objectKey
      + '" itemProp="'
      + propName
      + '" property="'
      + propName
      + '">'
      + (subTag.length ? '<' + subTag + '>' : '')
      + object[objectKey]
      + (subTag.length ? '<' + subTag + '/>' : '')
      + '</'
      + tagType
      + '>';
    }
    return '';
  }

  /**
   * updateHtml : transform pattern+resource props into a react element
   * @return {ReactElement} markup
   */
  updateHtml(resource, pattern) {
    const journalExpression = ['<span class="peritext-contents-citation-journal" itemProp="isPartOf" itemScope itemType="http://schema.org/Periodical" typeof="Periodical">',
                                '<span itemProp="name" property="name">',
                                '</span>',
                                '</span>'
                                ];
    const volumeExpression = ['<span class="peritext-contents-citation-volume" itemScope itemProp="hasPart" itemType="http://schema.org/PublicationVolume" typeof="PublicationVolume">',
                                '<span itemProp="volumeNumber" property="volumeNumber">',
                                '</span>',
                                '</span>'
                                ];
    const issueExpression = ['<span class="peritext-contents-citation-issue" itemScope itemProp="hasPart" itemType="http://schema.org/PublicationIssue" typeof="PublicationIssue">',
                                '<span itemProp="issueNumber" property="issueNumber">',
                                '</span>',
                                '</span>'
                                ];

    let expression = journalExpression[0] + pattern.replace('${journal}', journalExpression[1] + resource.journal + journalExpression[2]) + journalExpression[3];

    expression = expression.replace('${date}', ReactDOMServer.renderToStaticMarkup(<StructuredDate value={resource.date}/>));

    if (resource.volume) {
      expression = expression.replace('${volume}', volumeExpression[0] + volumeExpression[1] + resource.volume + volumeExpression[2]);
    } else expression = expression.replace('${volume}', '');

    if (resource.issue) {
      expression = expression.replace('${issue}', issueExpression[0] + issueExpression[1] + resource.issue + issueExpression[2] + issueExpression[3] + volumeExpression[3]);
    } else expression = expression.replace('${issue}', volumeExpression[3]);

    if (resource.issn) {
      expression = expression.replace('${issn}', this.formatSimpleProp(resource, 'issn', 'issn'));
    } else expression = expression.replace('${issn}', '');
    return this.htmlToReactParser.parse(expression);
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return this.updateHtml(this.props.resource, this.props.pattern);
    /*
    return (
      <span
        className="peritext-contents-journal"
        itemProp="{this.props.property}"
        property="{this.props.property}"
        itemScope
        itemType="http://schema.org/Periodical"
        typeof="Periodical"
        resource={this.props.resource.journal}
      >
        {this.updateHtml(this.props.resource, this.props.pattern)}
      </span>
    );
    */
  }
}
