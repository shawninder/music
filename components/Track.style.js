import css from 'styled-jsx/css'

import colors from '../styles/colors'
import lengths from '../styles/lengths'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'
import alpha from '../helpers/alpha'

export default css`
  .track {
    position: relative;
    cursor: pointer;
    display: grid;
    background: ${alpha(colors.textBgOdd, colors.opacity)};
    transition-property: background-color;
    transition-duration: ${durations.instant};
    grid-template-columns: 100px 1fr 50px;
    grid-template-rows: 1fr minmax(${lengths.rowHeight}, min-content) 1fr;
    grid-template-areas:
      "actionListAbove  actionListAbove  actionListAbove"
      "left             right            corner"
      "actionListBelow  actionListBelow  actionListBelow";

    .toggle {
      width: 100px;
      padding: 2px 5px;
      font-size: x-small;
      font-weight: bold;
      grid-area: left;
    }

    .art {
      border-radius: 5px;
    }

    .idx {
      display: inline-block;
      width: 25px;
      text-align: right;
      transform: translate(-25px);
      transition-property: transform;
      transition-duration: ${durations.instant};
      transition-timing-function: ${tfns.easeInOutQuad};
    }
    .toggled .idx {
      transform: translate(-5px);
    }

    .art-img {
      border-radius: 5px;
      width: 60px;
      height: 45px;
      vertical-align: middle;
      transform: translate(-25px);
      transition-property: transform;
      transition-duration: ${durations.instant};
      transition-timing-function: ${tfns.easeInOutQuad}
    }
    .toggled .art-img {
      transform: translate(0);
    }

    .body {
      grid-area: right;
    }
    .actionToggle {
      grid-area: corner;
      padding: 7px 15px 5px 5px;
      border: 0;
      background: transparent;
      color: inherit;
    }

    &.showingActions {
      background: ${colors.textBgOdd};
    }

    &.busy {
      .idx {
        transform: translate(-13px);
      }
      .art-img {
        transform: translate(-13px);
      }
    }
  }
`
