import React from 'react';
import {v4} from 'uuid';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Button from './Button';
import Welcome from './Welcome';

import DynamicTimeline from '../src/contextualizers/timeline/DynamicTimeline';

require('./../src/config/defaultStyles/global.css');


const styles = {
  aside: {
    maxWidth: 500,
    position: 'absolute',
    height: '100%',
    left: 0,
    top: 0,
    width: '50%'
  },
  component: {
    background: 'yellow',
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    padding: 0,
    margin: 0
  }
};

const mockTimelineContextualization = {
  "id": "contextualization-1446e9ca-c8ab-4e44-958c-163ae80bffa0",
  "contextualizer": "contextualization-e5b3c849-f022-4453-a42e-4d26e27d9c28",
  "resources": [
    "temporal_data"
  ],
  "type": "block",
  "nodePath": [
    "partie_1",
    "contents",
    4,
    "children",
    0
  ],
  "resPrint": "temporal_data",
  "precursorId": "contextualization-5e863f30-5722-4df0-b70c-7daa4287d5c0",
  "sectionOpCit": true,
  "sectionIbid": true,
  "startat": "21/01/2015",
  "dateformat": "%d/%m/%Y",
  "title": "My cool timeline",
  "outputmode": "all",
  "layer": [
    {
      "dates": {
        "type": "path",
        "target": "data",
        "path": [
          "@res1",
          "data",
          "Start Date"
        ]
      },
      "labels": {
        "type": "path",
        "target": "data",
        "path": [
          "@res1",
          "data",
          "Headline"
        ]
      },
      "title": "hello ça va"
    },
    {
      "dates": {
        "type": "path",
        "target": "data",
        "path": [
          "@res1",
          "data",
          "Start Date"
        ]
      },
      "labels": {
        "type": "path",
        "target": "data",
        "path": [
          "@res1",
          "data",
          "Headline"
        ]
      }
    }
  ],
  "describedInline": true,
  "contextualizerType": "timeline",
  "disposition": "superpose",
  "overloading": "@cool_timeline"
};

const mockResources = [{
  id: 'temporal_data',
  url: "@assets/timeline_data.csv",
  bibType: "tabularData",
  title: "cool data"
}];

const AsideContainer = ({children}) => (
  <aside style={styles.aside}>
    {children}
  </aside>
)

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')}/>
  ));

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
  ));

storiesOf('Timeline', module)
  .add('default', () => (
    <AsideContainer>
      <DynamicTimeline
        style={styles.component}
        captionContent="hello caption"
        resources={mockResources}
        datasets={{
          temporal_data: {
            format: 'json',
            data: require('dsv!./mock_data/timeline_data.csv')
          }
        }}
        contextualization = {mockTimelineContextualization}
        id = {v4()}
      />
    </AsideContainer>
  ))
