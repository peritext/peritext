import React, {PropTypes} from 'react';
import reactStringReplace from 'react-string-replace';
import {
  StructuredDate
  // , StructuredSpan
} from './../index.js';

import Radium from 'radium';

// let styles = {};

/**
 * dumb component for rendering the structured representation of parent journal information
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

  /**
   * updateHtml : transform pattern+resource props into a react element
   * @return {ReactElement} markup
   */
  updateHtml(resource, pattern) {
    let replacedText;
    replacedText = reactStringReplace(pattern, /(\${journal})/g, (match, index)=> (
      <span key={match + index} className="peritext-structured-parent-journal-journal">{resource.journal}</span>
    ));

    replacedText = reactStringReplace(replacedText, /(\${date})/g, (match, index)=> (
      <span key={match + index} className="peritext-structured-parent-journal-date">{resource.date || resource.year}</span>
    ));

    replacedText = reactStringReplace(replacedText, /(\${volume})/g, (match, index)=> (
      <span key={match + index} className="peritext-structured-parent-journal-volume">{resource.volume}</span>
    ));

    replacedText = reactStringReplace(replacedText, /(\${issue})/g, (match, index)=> (
      <span key={match + index} className="peritext-structured-parent-journal-issue">{resource.issue}</span>
    ));

    replacedText = reactStringReplace(replacedText, /(\${issn})/g, (match, index)=> (
      <span key={match + index} className="peritext-structured-parent-journal-issn">{resource.issn}</span>
    ));
    return replacedText;
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    // return this.updateHtml(this.props.resource, this.props.pattern);

    return (
      <span
        className="peritext-structured-parent-journal-container"
        itemProp={this.props.property}
        property={this.props.property}
        itemScope
        itemType="http://schema.org/Periodical"
        typeof="Periodical"
        resource={this.props.resource.issn + this.props.resource.journal}
      >
        <span style={{display: 'none'}} itemProp="name" property="name">{this.props.resource.journal}</span>
        <span
          itemProp="hasPart"
          property="hasPart"
          itemScope
          itemType="http://schema.org/PublicationVolume"
          typeof="PublicationVolume"
          resource={this.props.resource.issn + this.props.resource.journal + '-volume' + this.props.resource.volume}
          style={{display: 'none'}}
        >
          <span itemProp="volumeNumber" property="volumeNumber">{this.props.resource.volume}</span>
          <span
            itemProp="hasPart"
            property="hasPart"
            itemScope
            itemType="http://schema.org/PublicationIssue"
            typeof="PublicationIssue"
            resource={this.props.resource.issn + this.props.resource.journal + '-volume' + this.props.resource.volume + '-issue' + this.props.resource.issue}
          >
            <span itemProp="issueNumber" property="issueNumber">{this.props.resource.issue}</span>
            <StructuredDate value={this.props.resource.date || this.props.resource.year}/>
          </span>
        </span>
        <span
          itemProp="issn"
          style={{display: 'none'}}
          property="issn">
            {this.props.resource.issn}
        </span>

        {this.updateHtml(this.props.resource, this.props.pattern)}
      </span>
    );
  }
}
