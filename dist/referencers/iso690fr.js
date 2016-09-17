'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InlineCitation = exports.BlockCitation = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _citationModels = require('./../core/utils/citationUtils/citationModels.js');

var _components = require('./../core/components/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * iso690 bibliographic norm formatter (lang: fr)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @module referencers/iso690fr
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @todo Not finished resourceType-to-citation mapping (documented properly only books and journal articles - setup a default presentation for others)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Doc 1 : http://revues.refer.org/telechargement/fiche-bibliographie.pdf
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Doc 2 : https://www.mpl.ird.fr/documentation/download/FormBibliog.pdf
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

/**
 * Renders additionnal citation information, such as pages mentions, translations, etc.
 * @param {Object} propsObj - the React element props
 * @return {ReactElement} markup
 */
var renderAdditionnal = function renderAdditionnal(propsObj) {
  var details = propsObj.contextualization;
  if (!details) {
    return '';
  }
  return _react2.default.createElement(
    'span',
    { className: 'peritext-citation-details' },
    details.page || details.pages || propsObj.resource.caption || propsObj.resource.note || propsObj.resource.translation || propsObj.resource.original ? ', ' : '',
    details.page ? _react2.default.createElement(
      'span',
      { className: 'peritext-citation-quote-pages' },
      'p. ',
      details.page
    ) : '',
    details.pages ? _react2.default.createElement(
      'span',
      { className: 'peritext-citation-quote-pages' },
      'pp. ',
      details.pages
    ) : '',
    (details.page || details.pages) && propsObj.resource.caption ? ', ' : '',
    propsObj.resource.caption ? _react2.default.createElement(_components.StructuredSpan, { htmlClass: 'peritext-citation-comment', property: 'comment', value: propsObj.resource.caption }) : '',
    (details.page || details.pages) && propsObj.resource.note ? ', ' : '',
    propsObj.resource.note ? _react2.default.createElement(_components.StructuredSpan, { htmlClass: 'peritext-citation-comment', property: 'comment', value: propsObj.resource.note }) : '',
    propsObj.resource.translation ? _react2.default.createElement(
      'span',
      { className: 'peritext-citation-translation' },
      '. Traduction : ',
      _react2.default.createElement(
        'q',
        null,
        'details.translation'
      )
    ) : '',
    propsObj.resource.translation ? _react2.default.createElement(
      'span',
      { className: 'peritext-citation-original' },
      '. Citation originale : ',
      _react2.default.createElement(
        'q',
        null,
        'details.original'
      )
    ) : ''
  );
};

/**
 * Dumb component for rendering a iso690fr block citation
 */

var BlockCitation = exports.BlockCitation = function (_BlockCitationModel) {
  _inherits(BlockCitation, _BlockCitationModel);

  /**
   * constructor
   * @param {object} props
   */

  function BlockCitation() {
    _classCallCheck(this, BlockCitation);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BlockCitation).call(this));

    _this.renderAdditionnal = renderAdditionnal;
    return _this;
  }

  /**
   * propTypes
   * @property {object} resource - the resource to build the citation with
   * @property {object} contextualization - the contextualization to build the citation with
   */

  /**
   * Renders additionnal citation information, such as pages mentions, translations, etc.
   */


  _createClass(BlockCitation, [{
    key: 'renderAuthors',

    /**
     * Renders the representation of involved author (from resource), for long citations outputs
     * @return {ReactElement} markup
     */
    value: function renderAuthors() {
      var _this2 = this;

      var pattern = '${lastName:capitals}, ${firstName}';
      if (this.props.resource.author && this.props.resource.author.length <= 2) {

        return _react2.default.createElement(
          'span',
          { className: 'peritext-citation-authors' },
          this.props.resource.author.map(function (author, index) {
            return _react2.default.createElement(
              'span',
              { key: author.id },
              _react2.default.createElement(_components.StructuredPerson, { resource: author, pattern: pattern, property: 'author' }),
              index < _this2.props.resource.author.length - 1 ? ' et ' : ''
            );
          })
        );
      } else if (this.props.resource.author) {
        return _react2.default.createElement(
          'span',
          { className: 'peritext-citation-authors' },
          _react2.default.createElement(_components.StructuredPerson, { resource: this.props.resource.author[0], pattern: pattern, property: 'author' }),
          _react2.default.createElement(
            'i',
            { className: 'peritext-citation-etal' },
            'et al.'
          )
        );
      }
      return '';
    }

    /**
     * Renders the complete reference of a resource
     * @return {ReactElement} markup
     */

  }, {
    key: 'renderCompleteReference',
    value: function renderCompleteReference() {
      switch (this.props.resource.bibType) {
        /* case book not set because is default for now
        case 'book':
        break;*/
        case 'article':
          if (this.props.opCit === true) {
            return _react2.default.createElement(
              'span',
              { className: 'peritext-citation-detailed-reference-container' },
              this.renderAuthors(),
              ', ',
              _react2.default.createElement(
                'i',
                { className: 'peritext-citation-opcit' },
                'op.cit.'
              )
            );
          }
          var pages = Array.isArray(this.props.resource.pages) ? this.props.resource.pages : this.props.resource.pages.split('-');
          return _react2.default.createElement(
            'span',
            { className: 'peritext-citation-detailed-reference-container' },
            this.renderAuthors(),
            _react2.default.createElement(
              'span',
              null,
              '. '
            ),
            _react2.default.createElement(_components.StructuredCite, { value: this.props.resource.title }),
            _react2.default.createElement(
              'span',
              null,
              '. '
            ),
            _react2.default.createElement(_components.StructuredParentJournal, { resource: this.props.resource, pattern: '${journal}, ${date}, vol. ${volume}, n° ${issue}, ISSN : ${issn}' }),
            this.props.resource.pages ? ', pp. ' : '',
            this.props.resource.pages ? _react2.default.createElement(_components.StructuredSpan, { htmlClass: 'peritext-citation-pages-in-publication', property: 'pageStart', value: pages[0] }) : '',
            this.props.resource.pages ? '-' : '',
            this.props.resource.pages ? _react2.default.createElement(_components.StructuredSpan, { htmlClass: 'peritext-citation-pages-in-publication', property: 'pageEnd', value: pages[1] }) : ''
          );
        default:
          if (this.props.opCit === true) {
            return _react2.default.createElement(
              'span',
              { className: 'peritext-citation-detailed-reference-container' },
              this.renderAuthors(),
              ', ',
              _react2.default.createElement(
                'i',
                { className: 'peritext-citation-opcit' },
                'op.cit.'
              )
            );
          }
          return _react2.default.createElement(
            'span',
            { className: 'peritext-citation-detailed-reference-container' },
            this.renderAuthors(),
            this.props.resource.author ? _react2.default.createElement(
              'span',
              null,
              '. '
            ) : '',
            _react2.default.createElement(_components.StructuredCite, { value: this.props.resource.title }),
            this.props.resource.edition ? '. ' : '',
            this.props.resource.edition ? _react2.default.createElement(_components.StructuredSpan, { htmlClass: 'peritext-citation-publication-edition', property: 'bookEdition', value: this.props.resource.edition }) : '',
            this.props.resource.publisher ? '. ' : '',
            this.props.resource.publisher ? _react2.default.createElement(_components.StructuredPublisher, { resource: this.props.resource }) : '',
            this.props.resource.year || this.props.resource.date ? ', ' : '',
            this.props.resource.year || this.props.resource.date ? _react2.default.createElement(_components.StructuredSpan, { htmlClass: 'peritext-citation-publication-edition', property: 'datePublished', value: this.props.resource.year || this.props.resource.date }) : ''
          );
      }
    }

    /**
     * Renders additionnal reference information (isbn, doi, url)
     * @return {ReactElement} markup
     */

  }, {
    key: 'renderReferenceDecoration',
    value: function renderReferenceDecoration() {
      if (this.props.resource.isbn || this.props.resource.url || this.props.resource.doi) {
        return _react2.default.createElement(
          'span',
          { className: 'peritext-citation-reference-decoration-container' },
          this.props.resource.isbn ? '. ISBN : ' : '',
          this.props.resource.isbn ? _react2.default.createElement(_components.StructuredSpan, { htmlClass: 'peritext-citation-isbn', property: 'isbn', value: this.props.resource.isbn }) : '',
          this.props.resource.doi ? '. DOI : ' : '',
          this.props.resource.doi ? _react2.default.createElement(
            'a',
            { className: 'peritext-citation-doi', target: 'blank', itemProp: 'sameAs', property: 'sameAs', href: this.props.resource.doi },
            this.props.resource.doi
          ) : '',
          this.props.resource.doi ? '. Accessible en ligne : ' : '',
          this.props.resource.doi ? _react2.default.createElement(
            'a',
            { className: 'peritext-citation-url', target: 'blank', itemProp: 'url', property: 'url', href: this.props.resource.url },
            this.props.resource.url
          ) : ''
        );
      }
    }

    /**
     * Renders final markup of the contextualization
     * @return {ReactElement} markup
     */

  }, {
    key: 'renderReference',
    value: function renderReference() {
      return _react2.default.createElement(
        'span',
        {
          className: 'peritext-citation-reference-container'
        },
        this.props.ibid === true ? _react2.default.createElement(
          'i',
          {
            className: 'peritext-citation-ibid'
          },
          'ibid.'
        ) : '',
        this.renderCompleteReference(),
        this.renderReferenceDecoration(),
        _react2.default.createElement(
          'span',
          null,
          '.'
        )
      );
    }
  }]);

  return BlockCitation;
}(_citationModels.BlockCitationModel);

/**
 * Dumb component for rendering a iso690fr inline citation
 */


BlockCitation.propTypes = {
  contextualization: _react.PropTypes.object,
  resource: _react.PropTypes.object
};

var InlineCitation = exports.InlineCitation = function (_InlineCitationModel) {
  _inherits(InlineCitation, _InlineCitationModel);

  /**
   * constructor
   * @param {object} props
   */

  function InlineCitation() {
    _classCallCheck(this, InlineCitation);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(InlineCitation).call(this));

    _this3.renderAdditionnal = renderAdditionnal;
    return _this3;
  }

  /**
   * propTypes
   * @property {object} resource - the resource to build the citation with
   * @property {object} contextualization - the contextualization to build the citation with
   */


  /**
   * Renders additionnal citation information, such as pages mentions, translations, etc.
   */


  _createClass(InlineCitation, [{
    key: 'renderAuthors',


    /**
     * Renders the representation of involved author (from resource), for short citations outputs
     * @return {ReactElement} markup
     */
    value: function renderAuthors() {
      var _this4 = this;

      if (this.props.resource.author.length <= 2) {
        return this.props.resource.author.map(function (author, index) {
          return _react2.default.createElement(
            'span',
            { key: author.id, className: 'peritext-citation-authors' },
            _react2.default.createElement(_components.StructuredPerson, { resource: author, pattern: '${lastName:capitals}', property: 'author' }),
            index < _this4.props.resource.author.length - 1 ? ' et ' : ''
          );
        });
      }
      return _react2.default.createElement(
        'span',
        { className: 'peritext-citation-authors' },
        _react2.default.createElement(_components.StructuredPerson, { resource: this.props.resource.author[0], pattern: '${lastName:capitals}', property: 'author' }),
        _react2.default.createElement(
          'i',
          { className: 'peritext-citation-et-al' },
          'et al.'
        )
      );
    }

    /**
     * Renders final markup of the contextualization
     * @return {ReactElement} markup
     */

  }, {
    key: 'renderReference',
    value: function renderReference() {
      if (this.props.ibid === true) {
        return _react2.default.createElement(
          'span',
          { className: 'peritext-citation-brief-reference' },
          _react2.default.createElement(
            'i',
            {
              className: 'peritext-citation-ibid'
            },
            'ibid.'
          )
        );
      } else if (this.props.opCit === true) {
        return _react2.default.createElement(
          'span',
          { className: 'peritext-citation-brief-reference' },
          this.renderAuthors(),
          _react2.default.createElement(
            'span',
            null,
            ', '
          ),
          _react2.default.createElement(
            'i',
            {
              className: 'peritext-citation-opcit'
            },
            'op.cit.'
          )
        );
      } else if (this.props.resource.date !== undefined || this.props.resource.year !== undefined) {
        var value = this.props.resource.date || this.props.resource.year;
        return _react2.default.createElement(
          'span',
          { className: 'peritext-citation-brief-reference' },
          this.renderAuthors(),
          _react2.default.createElement(
            'span',
            null,
            ', '
          ),
          _react2.default.createElement(_components.StructuredDate, { value: value, modificator: 'year' }),
          _react2.default.createElement(
            'span',
            { className: 'peritext-citation-year-suffix' },
            this.props.contextualization.yearSuffix
          )
        );
      }
      return _react2.default.createElement(
        'span',
        { className: 'peritext-citation-brief-reference' },
        this.renderAuthors()
      );
    }
  }]);

  return InlineCitation;
}(_citationModels.InlineCitationModel);

InlineCitation.propTypes = {
  contextualization: _react.PropTypes.object,
  resource: _react.PropTypes.object
};