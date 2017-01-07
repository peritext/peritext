import React from 'react';
import {v4} from 'uuid';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Button from './Button';
import Welcome from './Welcome';

import DynamicTimeline from '../src/contextualizers/timeline/DynamicTimeline';


const styles = {
  aside: {
    maxWidth: 500,
    background: 'yellow',
    position: 'absolute',
    height: '100%',
    left: 0,
    top: 0,
    width: '50%'
  }
}

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
        captionContent="hello caption"
        resources={[]}
        data={{
          myData: require('dsv!./mock_data/timeline_data.csv')
        }}
        contextualization = {{

        }}
        id = {v4()}
      />
    </AsideContainer>
  ))
