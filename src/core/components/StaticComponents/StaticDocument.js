import React, {PropTypes} from 'react';
import Radium from 'radium';
import { intlShape } from 'react-intl';

import {getMetaValue} from './../../utils/sectionUtils';
import {bibToSchema} from './../../utils/microDataUtils';
import {
  StaticBackCover,
  StaticEndNotes,
  StaticFrontCover,
  StaticGlossary,
  StaticReferencesList,
  StaticSection,
  StaticTableOfContents,
  StaticTableOfFigures,
  StructuredMetadataPlaceholder
} from './../index.js';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a static document
 */
@Radium
class StaticDocument extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    sections: PropTypes.array,
    renderingParams: PropTypes.object,
    glossaryData: PropTypes.array
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const { formatMessage } = this.context.intl;
    const bibType = bibToSchema(getMetaValue(this.props.sections[0].metadata, 'general', 'bibType'));
    const citeKey = getMetaValue(this.props.sections[0].metadata, 'general', 'citeKey');
    const tocData = this.props.sections.filter((sectio, index) =>{
      return index > 0;
    }).map((thisSection) => {
      return {
        id: getMetaValue(thisSection.metadata, 'general', 'citeKey'),
        title: getMetaValue(thisSection.metadata, 'general', 'title'),
        level: getMetaValue(thisSection.metadata, 'general', 'generalityLevel')
      };
    });

    if (this.props.renderingParams.notesPosition === 'documentend') {
      tocData.push({
        id: 'peritext-contents-notes-document-end',
        title: formatMessage({id: 'end_notes'}, {}),
        level: 0
      });
    }

    if (this.props.renderingParams.referenceScope === 'document') {
      tocData.push({
        id: 'peritext-contents-reference-list-container',
        title: formatMessage({id: 'references_title'}, {}),
        level: 0
      });
    }

    if (this.props.renderingParams.figuresTablePosition === 'begining') {
      tocData.splice(0, 0, {
        id: 'table-of-figures',
        title: formatMessage({id: 'table_of_figures'}, {}),
        level: 0
      });
    } else if (this.props.renderingParams.figuresTablePosition === 'end') {
      tocData.push({
        id: 'table-of-figures',
        title: formatMessage({id: 'table_of_figures'}, {}),
        level: 0
      });
    }

    if (this.props.renderingParams.glossaryPosition === 'begining') {
      tocData.splice(0, 0, {
        id: 'glossary',
        title: formatMessage({id: 'glossary'}, {}),
        level: 0
      });
    } else if (this.props.renderingParams.glossaryPosition === 'end') {
      tocData.push({
        id: 'glossary',
        title: formatMessage({id: 'glossary'}, {}),
        level: 0
      });
    }

    // making figures table data
    const figuresTableData = this.props.sections.reduce((figures, section)=> {
      // 1. take numbered figures
      const figuresL = section.contextualizations.filter((cont)=> {
        return cont.figureNumber !== undefined;
      })
      // 2. filter uniques
      .filter((figure, index, self) => self.findIndex((other) => {
        return other.figureNumber === figure.figureNumber;
      }) === index)
      // 3. make table array
      .map((cont)=> {
        return {
          id: 'peritext-contents-figure-' + cont.figureNumber,
          number: cont.figureNumber
        };
      });
      return figures.concat(figuresL);
    }, []);

    return (
        <section
          itemScope
          itemType={'http://schema.org/' + bibType}
          typeof={bibType}
          vocab="http://schema.org/"
          resource={'#' + citeKey}
        >
          <StructuredMetadataPlaceholder section={this.props.sections[0]} />

          {
            this.props.renderingParams.hasCover ?
            <StaticFrontCover metadata={this.props.sections[0].metadata} />
            : ''
          }

          {
            this.props.renderingParams.tocPosition === 'begining' ?
            <StaticTableOfContents elements={tocData} level={getMetaValue(this.props.sections[0].metadata, 'general', 'generalityLevel')} />
            : ''
          }

          {
            this.props.renderingParams.figuresTablePosition === 'begining' ?
            <StaticTableOfFigures elements={figuresTableData} />
            : ''
          }

          {
            this.props.renderingParams.glossaryPosition === 'begining' ?
            <StaticGlossary elements={this.props.glossaryData} />
            : ''
          }

          <section
            className="peritext-contents-section-contents"
            dangerouslySetInnerHTML={{
              __html: this.props.sections[0].outputHtml
            }}
          ></section>
          {
            this.props.renderingParams.notesPosition === 'sectionend' ?
              <StaticEndNotes
                classSuffix="section-end"
                notes={this.props.sections[0].notes}
              /> : ''
          }

          {
            this.props.sections.slice(1).map((section, sectionIndex)=> {
              return <StaticSection section={section} key={sectionIndex} renderingParams={this.props.renderingParams} />;
            })
          }

          {
            this.props.renderingParams.notesPosition === 'documentend' ?
            <StaticEndNotes
              classSuffix="document-end"
              notes={
                this.props.sections.reduce((nots, sectio) =>{
                  return nots.concat(sectio.notes || []);
                }, [])
              }
            /> : ''
          }

          {
            this.props.renderingParams.referenceScope === 'document' ?
            <StaticReferencesList references={this.props.sections[0].references} renderingParams={this.props.renderingParams} />
            : ''
          }

          {
            this.props.renderingParams.glossaryPosition === 'end' ?
            <StaticGlossary elements={this.props.glossaryData} />
            : ''
          }

          {
            this.props.renderingParams.figuresTablePosition === 'end' ?
            <StaticTableOfFigures elements={figuresTableData} />
            : ''
          }

          {
            this.props.renderingParams.tocPosition === 'end' ?
            <StaticTableOfContents elements={tocData} level={getMetaValue(this.props.sections[0].metadata, 'general', 'generalityLevel')} />
            : ''
          }

          {
            this.props.renderingParams.hasCover ?
            <StaticBackCover metadata={this.props.sections[0].metadata} />
            : ''
          }
        </section>
    );
  }
}

StaticDocument.contextTypes = { intl: intlShape };
export default StaticDocument;
