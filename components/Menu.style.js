import css from 'styled-jsx/css'

import colors from '../styles/colors'
import lengths from '../styles/lengths'

export default css`
  .menu {
    position: fixed;
    top: 0;
    right: 0;
    max-width: ${lengths.rowHeight};
    border-radius: 0 0 0 3px;
    font-size: medium;
    z-index: 4;
    color: ${colors.text};
    background-color: ${colors.textBg};
    font-family: palatino;
    box-shadow: -5px 0 5px 0px rgb(0, 0, 0, 0.25);
    .tab {
      padding: 5px;
      height: ${lengths.collapsedHeight};
      cursor: pointer;
    }
    .branding {
      float: left;
      font-weight: bold;
      position: absolute;
      padding: 5px;
      top: 0;
      left: 0;
      opacity: 0;
    }
    .face {
      margin: 5px;
      width: 30px;
      height: 30px;
      float: right;
    }
    &.attending {
      background-color: ${colors.attendingBg};
    }
    &.hosting {
      background-color: ${colors.hosting};
    }
    .contents {
      text-align: center;
      .login {
        label {
          padding: 10px;
          font-family: monospace;
          font-size: 2em;
          input {
            margin-bottom: 5px;
            font-size: medium;
            line-height: 2em;
            font-family: sans-serif;
          }
        }
      }
      .integrations {
        :global(li) {
          display: inline-block;
        }
      }
      .apps :global(.list li) {
        display: inline-block;
      }
    }
  }
  @media (min-width: ${lengths.mediaWidth}) {
    .menu {
      max-width: ${lengths.menuWidth};
      .branding {
        opacity: 1;
      }
    }
  }
`
