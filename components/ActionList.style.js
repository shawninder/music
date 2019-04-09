import css from 'styled-jsx/css'

import colors from '../styles/colors'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

export default css`
  .below {
    grid-area: actionListBelow;
    border-radius: 0 0 5px 5px;
    box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.5);
  }
  .above {
    grid-area: actionListAbove;
    border-radius: 5px 5px 0 0;
    box-shadow: 0 -5px 5px 0 rgba(0, 0, 0, 0.5);
    bottom: 0;
  }
  .action-list {
    width: 90%;
    position: absolute;
    color: ${colors.text2};
    background: ${colors.textBg};
    z-index: 5;
    transition-property: opacity, transform;
    transition-duration: ${durations.instant};
    transition-timing-function: ${tfns.easeInOutQuad};
  }
  .action-list.hidden {
    opacity: 0;
    transform: rotateX(90deg) translateY(-50%);
  }
  .action-list.showing {
    opacity: 1;
    transform: rotateX(0) translateY(0);
  }
`
