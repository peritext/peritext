/**
 * Utils - dedicated to create a super abstract class for producing citation style specific, citation components
 * @module utils/citationModels
 */
import React, {PropTypes} from 'react';
import {
  StructuredCOinS
} from './../../components';
import * as formatter from './../microDataUtils/';

/**
 * Virtual component class for rendering generic block citations
 */
export class BlockCitationModel extends React.Component {
  /**
   * propTypes
   * @property {object} resource - the resource to use for making the citation
   * @property {object} contextualization - the details of contextualization (e.g. page)
   * @property {boolean} ibid - immediately recurrent citation ?
   * @property {boolean} opCit - not immediately recurent citation ?
   * @property {string} schemaType - microformat type fo the item
   */
  static propTypes = {
    resource: PropTypes.object,
    contextualization: PropTypes.object,
    ibid: PropTypes.bool,
    opCit: PropTypes.bool,
    schemaType: PropTypes.string
  };

  /**
   * Gets the schematype of the citation, from contextualization statement or from the resource bibType
   * @return schemaType - the schematype of the citation
  */
  getSchemaType() {
    return this.props.schemaType || formatter.bibToSchema(this.props.resource.bibType);
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <p
      id={this.props.contextualization.citeKey}
      className="peritext-block-citation"
      itemProp="citation"
      property="citation"
      itemScope
      itemType={'http://schema.org/' + this.getSchemaType()}
      typeof={this.getSchemaType()}
    >
      <StructuredCOinS resource={this.props.resource} />
      {this.renderReference()}
      {this.renderAdditionnal(this.props)}
    </p>);
  }
}

/**
 * Virtual component class for rendering generic inline citations
 */
export class InlineCitationModel extends React.Component {
  /**
   * propTypes
   * @property {object} resource the resource to use for making the citation
   * @property {object} contextualization the details of contextualization (e.g. page)
   * @property {boolean} ibid immediately recurent citation ?
   * @property {boolean} opCit not immediately recurent citation ?
   * @property {string} schemaType microformat type fo the item
   */
  static propTypes = {
    resource: PropTypes.object,
    contextualization: PropTypes.object,
    ibid: PropTypes.bool,
    opCit: PropTypes.bool,
    schemaType: PropTypes.string
  };

  /**
   * Gets the schematype of the citation, from contextualization statement or from the resource bibType
   * @return schemaType - the schematype of the citation
  */
  getSchemaType() {
    return this.props.schemaType || formatter.bibToSchema(this.props.resource.bibType);
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (<span
      id={this.props.contextualization.citeKey}
      className="peritext-inline-citation"
      itemProp="citation"
      property="citation"
      itemScope
      itemType={'http://schema.org/' + this.getSchemaType()}
      typeof={this.getSchemaType()}
    >
      {this.renderReference()}
      {this.renderAdditionnal(this.props)}
    </span>);
  }
}
