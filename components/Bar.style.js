import css from 'styled-jsx/css'

import lengths from '../styles/lengths'
import colors from '../styles/colors'
import durations from '../styles/durations'

export default css`
  button {
    border: 0;
    background: transparent;
  }
  .bar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 3;
    height: ${lengths.rowHeight};
    width: 100%;
    display: grid;
    grid-template-columns: ${lengths.rowHeight} 1fr ${lengths.rowHeight} ${lengths.rowHeight};
    grid-template-rows: ${lengths.rowHeight};
    grid-template-areas:
      "bar-menu bar-field bar-dismiss menu";

    .bar-menu {
      grid-area: bar-menu;
      cursor: pointer;
      color: ${colors.textBg};
      z-index: 5;
      padding: 12px;
      &:focus, &:hover {
        color: ${colors.primaryBg};
      }
    }
    .bar-dismiss {
      grid-area: bar-dismiss;
      cursor: pointer;
      z-index: 4;
      padding: 12px;
      color: ${colors.textBg};
    }
    .bar-list {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: ${lengths.rowHeight} 1fr;
      grid-template-areas:
        "nothing"
        "results";
      transition-property: opacity;
      transition-duration: ${durations.moment};
      color: ${colors.black};
      .loader {
        text-align: center;
        cursor: text;
      }
      & > ol {
        grid-area: results;
        max-height: 100vh;
        overflow: auto;
      }
    }
  }
  @media (min-width: ${lengths.mediaWidth}) {
    .bar {
      grid-template-columns: ${lengths.rowHeight} 1fr ${lengths.rowHeight} ${lengths.menuWidth};
    }
  }
`
