import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Spotlight from './icons/Spotlight'
import colors from '../styles/colors'

function OgImg (props) {
  const classes = props.className ? props.className.split(' ') : []
  classes.push('ogImg')
  return (
    <div className={classes.join(' ')}>
      <div className='name'>
        <p className='name-one'>Crowd's</p>
        <p className='name-two'>Play</p>
      </div>
      <div className='face'>
        <Spotlight size={410} />
      </div>
      <style jsx>{`
        .ogImg {
          position: relative;
          overflow: hidden;
          font-family: palatino;
          width: 1200px;
          height: 630px;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 150px 480px;
          grid-template-areas:
            "bar"
            "face";

          .name {
            grid-area: bar;
            font-size: 130px;
            line-height: 1em;
            display: grid;
            grid-template-columns: 720px 480px;
            grid-template-rows: 150px;
            grid-template-areas: "name-one name-two";
            z-index: 2;
            box-shadow: 0 5px 30px 3px #333333;
            .name-one, .name-two {
              margin: 0;
              padding: 10px;
            }
            .name-one {
              grid-area: name-one;
              font-weight: bold;
              background: ${colors.text};
              color: ${colors.textBg};
              text-align: right;
            }
            .name-two {
              grid-area: name-two;
              height: 153px;
              background: ${colors.textBg};
              color: ${colors.text};
              border-radius: 0 0 0 5px;
            }
          }
          .face {
            grid-area: face;
            background: ${colors.text} url("/static/bg.svg") no-repeat top left;
            background-size: 100% 100%;
            z-index: 1;
            padding: 30px;
            :global(.spotlight) {
              width: 410px;
              height: 410px;
              border-radius: 410px;
              padding: 20px;
              margin: 0 auto;
              :global(.jingles, .jingles-shadow) {
                width: 300px;
                height: 300px;
              }
              :global(.jingles-shadow) {
                filter: blur(10px);
              }
            }
          }
        }
      `}</style>
    </div>
  )
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' }
]

OgImg.defaultProps = defaultProps(props)
OgImg.propTypes = propTypes(props)

export default OgImg
