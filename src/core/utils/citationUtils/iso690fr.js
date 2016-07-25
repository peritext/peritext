/**
 * iso690 bibliographic norm formatter (lang: fr)
 * Doc 1 : http://revues.refer.org/telechargement/fiche-bibliographie.pdf
 * Doc 2 : https://www.mpl.ird.fr/documentation/download/FormBibliog.pdf
 * TODO 1 : Not finished resourceType-to-citation mapping (documented properly only books and journal articles - setup a default presentation for others)
 * TODO 2 : handle year numerotation - if several publications of the same author(s) are cited, they should be alphabetically numeroted in the order of bibliography
 * (this require to handle the ${bibliography} template feature first, then update code accordingly)
 */
import React from 'react';
import {InlineCitationModel, BlockCitationModel} from './_static.js';
import {
  StructuredPerson,
  StructuredDate,
  StructuredParentJournal,
  StructuredSpan,
  StructuredPublisher,
  StructuredCite
} from './../../components/';
import Radium from 'radium';

function renderAdditionnal(obj) {
  const contextualization = obj.contextualization;
  return (
    <span className="peritext-contents-citation-details">
      {contextualization.page || contextualization.pages || obj.resource.caption || obj.resource.note || obj.resource.translation || obj.resource.original ? ', ' : ''}
      {contextualization.page ?
        <span className="peritext-contents-citation-quote-pages">
        p. {contextualization.page}
        </span>
       : ''}
       {contextualization.pages ?
        <span className="peritext-contents-citation-quote-pages">
        pp. {contextualization.pages}
        </span>
       : ''}
       {(contextualization.page || contextualization.pages) && obj.resource.caption ? ', ' : ''}
       {obj.resource.caption ?
        <StructuredSpan htmlClass="peritext-contents-citation-comment" property="comment" value={obj.resource.caption} />
       : ''}
       {(contextualization.page || contextualization.pages) && obj.resource.note ? ', ' : ''}
       {obj.resource.note ?
        <StructuredSpan htmlClass="peritext-contents-citation-comment" property="comment" value={obj.resource.note} />
       : ''}
       {obj.resource.translation ?
          <span className="peritext-contents-citation-translation">
            . Traduction : <q>contextualization.translation</q>
          </span>
          : ''
        }
       {obj.resource.translation ?
          <span className="peritext-contents-citation-original">
            . Citation originale : <q>contextualization.original</q>
          </span>
          : ''
        }
    </span>
  );
}

/**
 * Dumb component for rendering a iso690fr block citation
 */
@Radium
export class BlockCitation extends BlockCitationModel {

  constructor() {
    super();
  }

  renderAdditionnal = renderAdditionnal;

  renderAuthors() {
    const pattern = '${lastName:capitals}, ${firstName}';
    if (this.props.resource.author && this.props.resource.author.length <= 2) {

      return (<span className="peritext-contents-citation-authors">
          {this.props.resource.author.map((author, index) => {
            return (
                <span key={author.citeKey}>
                  <StructuredPerson resource={author} pattern={pattern} property="author" />
                  {(index < this.props.resource.author.length - 1) ? ' et ' : ''}
                </span>
              );
          })}
      </span>);
    } else if (this.props.resource.author) {
      return (
          <span className="peritext-contents-citation-authors">
            <StructuredPerson resource={this.props.resource.author[0]} pattern={pattern} property="author" />
            <i className="peritext-contents-citation-etal">et al.</i>
          </span>
      );
    }
    return '';
  }

  renderCompleteReference() {
    switch (this.props.resource.bibType) {
    /* case book not set because is default for now
    case 'book':
    break;*/
    case 'article':
      if (this.props.opCit === true) {
        return (
          <span className="peritext-contents-citation-complete-reference">
            {this.renderAuthors()}, <i className="peritext-contents-citation-opcit">op.cit.</i>
          </span>
        );
      }
      const pages = (Array.isArray(this.props.resource.pages)) ? this.props.resource.pages : this.props.resource.pages.split('-');
      return (
        <span className="peritext-contents-citation-complete-reference">
          {this.renderAuthors()}
          <span>. </span>
          <StructuredCite value={this.props.resource.title} />
          <span>. </span>
          <StructuredParentJournal resource={this.props.resource} pattern="${journal}, ${date}, vol. ${volume}, n° ${issue}, ISSN : ${issn}" />
          {this.props.resource.pages ? ', pp. ' : ''}
          {this.props.resource.pages ? <StructuredSpan htmlClass="peritext-contents-citation-pages" property="pageStart" value={pages[0]} /> : ''}
          {this.props.resource.pages ? '-' : ''}
          {this.props.resource.pages ? <StructuredSpan htmlClass="peritext-contents-citation-pages" property="pageEnd" value={pages[1]} /> : ''}
        </span>
      );
    default:
      if (this.props.opCit === true) {
        return (
          <span className="peritext-contents-citation-complete-reference">
            {this.renderAuthors()}, <i className="peritext-contents-citation-opcit">op.cit.</i>
          </span>
        );
      }
      return (
        <span className="peritext-contents-citation-complete-reference">
          {this.renderAuthors()}
          {this.props.resource.author ? <span>. </span> : ''}
          <StructuredCite value={this.props.resource.title} />
          {this.props.resource.edition ? '. ' : ''}
          {this.props.resource.edition ? <StructuredSpan htmlClass="peritext-contents-citation-edition" property="bookEdition" value={this.props.resource.edition} /> : ''}
          {this.props.resource.publisher ? '. ' : ''}
          {this.props.resource.publisher ? <StructuredPublisher resource={this.props.resource} /> : ''}
          {this.props.resource.year || this.props.resource.date ? ', ' : ''}
          {this.props.resource.year || this.props.resource.date ? <StructuredSpan htmlClass="peritext-contents-citation-edition" property="datePublished" value={(this.props.resource.year || this.props.resource.date)} /> : ''}
        </span>
      );
    }
  }

  renderReferenceDecoration() {
    if (this.props.resource.isbn || this.props.resource.url || this.props.resource.doi) {
      return (
        <span className="peritext-contents-citation-reference-decoration">
          {this.props.resource.isbn ? '. ISBN : ' : ''}
          {this.props.resource.isbn ? <StructuredSpan htmlClass="peritext-contents-citation-isbn" property="isbn" value={this.props.resource.isbn} /> : ''}
          {this.props.resource.doi ? '. DOI : ' : ''}
          {this.props.resource.doi ?
            <a className="peritext-contents-citation-doi" target="blank" itemProp="sameAs" property="sameAs" href={this.props.resource.doi}>
              {this.props.resource.doi}
            </a> : ''}
          {this.props.resource.doi ? '. Accessible en ligne : ' : ''}
          {this.props.resource.doi ?
            <a className="peritext-contents-citation-url" target="blank" itemProp="url" property="url" href={this.props.resource.url}>
              {this.props.resource.url}
            </a> : ''}
        </span>
      );
    }
  }

  renderReference() {
    return (
      <span
        className="peritext-contents-citation-reference"
      >
        {this.props.ibid === true ?
          <i
            className="peritext-contents-citation-ibid"
          >
            ibid.
          </i> : ''}
        {this.renderCompleteReference()}
        {this.renderReferenceDecoration()}
        <span>.</span>
      </span>
    );
  }
}


/**
 * Dumb component for rendering a iso690fr inline citation
 */
@Radium
export class InlineCitation extends InlineCitationModel {

  constructor() {
    super();
  }

  renderAdditionnal = renderAdditionnal;

  renderAuthors() {
    if (this.props.resource.author.length <= 2) {
      return this.props.resource.author.map((author, index) => {
        return (
          <span key={author.citeKey} className="peritext-contents-citation-authors">
            <StructuredPerson resource={author} pattern="${lastName:capitals}" property="author" />
            {(index < this.props.resource.author.length - 1) ? ' et ' : ''}
          </span>
        );
      });
    }
    return (
        <span className="peritext-contents-citation-authors">
          <StructuredPerson resource={this.props.resource.author[0]} pattern="${lastName:capitals}" property="author" />
          <i className="peritext-contents-citation-etal">et al.</i>
        </span>
    );
  }

  renderReference() {
    if (this.props.ibid === true) {
      return (
        <span className="peritext-contents-citation-reference">
          <i
            className="peritext-contents-citation-ibid"
          >
            ibid.
          </i>
        </span>
      );
    } else if (this.props.opCit === true) {
      return (
        <span className="peritext-contents-citation-reference">
          {this.renderAuthors()}
          <span>, </span>
          <i
            className="peritext-contents-citation-opcit"
          >
            op.cit.
          </i>
        </span>
      );
    } else if (this.props.resource.date !== undefined || this.props.resource.year !== undefined) {
      const value = this.props.resource.date || this.props.resource.year;
      return (
        <span className="peritext-contents-citation-reference">
          {this.renderAuthors()}
          <span>, </span>
          <StructuredDate value={value} modificator="year" />
          <span className="peritext-contents-citation-year-suffix">{this.props.contextualization.yearSuffix}</span>
        </span>
      );
    }
    return (
      <span className="peritext-contents-citation-reference">
        {this.renderAuthors()}
      </span>
    );
  }
}
