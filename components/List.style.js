import css from 'styled-jsx/css'

import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

export default css`
  .list {
    transition-property: opacity, transform;
    transition-duration: ${durations.moment};
    transition-timing-function: ${tfns.easeInOutQuad};
  }
  .list.hidden {
    opacity: 0;
    transform: rotateX(90deg) translateY(-50%);
  }
  .list.showing {
    opacity: 1;
    transform: rotateX(0) translateY(0);
  }
`
