import css from 'styled-jsx/css'
import colors from '../styles/colors'

export default css`
  .action {
    width: 100%;
    height: 32px;
    display: grid;
    grid-template-columns: 100px 1fr 50px;
    grid-template-rows: 32px;
    grid-template-areas:
      "idx label icon";
    &:hover, &:focus {
      color: ${colors.primaryText};
      background: white;
    }
    span, img {
      vertical-align: middle;
    }
    .idx, .label {
      line-height: 20px;
      padding: 5px;
    }
    .idx {
      grid-area: idx;
      font-size: x-small;
      text-align: right;
      width: 35px;
    }
    .label {
      grid-area: label;
    }
    .icon {
      grid-area: icon;
      text-align: right;
      padding: 7px;
      width: 100%;
    }
    .icon svg.icon {
      color: ${colors.text2};
    }
  }
`
