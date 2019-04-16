import css from 'styled-jsx/css'

import lengths from '../styles/lengths'
import durations from '../styles/durations'
import colors from '../styles/colors'

export default css`
  input {
    position: fixed;
    top: 0;
    left: 0;
    height: ${lengths.rowHeight};
    width: 100%;
    font-size: large;
    font-weight: bold;
    padding: 5px 100px 5px 60px;
    z-index: 4;
    border: 0;
    color: ${colors.textBg};
    background: ${colors.text};
    border-radius: 0;
    box-shadow: 0px 5px 5px 0px rgb(0,0,0,0.25);
    transition-property: background-color;
    transition-duration: ${durations.moment};
    &::placeholder {
      color: ${colors.placeholder};
    }
  }
  @media (min-width: ${lengths.mediaWidth}) {
    padding: 5px 215px 5px 60px;
  }
`
