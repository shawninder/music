import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import MrJingles from './icons/Happy'
import colors from '../styles/colors'
import alpha from '../helpers/alpha'

import Dict from '../data/Dict'
import txt from '../data/txt.json'

class OgImg extends Component {
  static getInitialProps ({ renderPage, req }) {
    // TODO remove everything except the headers and query string stuff, which are the only non-default things I'm trying to do
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    return { headers, acceptLanguage }
  }
  constructor (props) {
    super(props)
    this.dict = new Dict(txt, ['en', 'fr'], props.acceptLanguage, global.navigator)
  }
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('box')
    const barHeight = 80
    const pad = 10
    return (
      <div className={classes.join(' ')}>
        <div className='name'>
          <p className='name-one'>Crowd's</p>
          <p className='name-two'>Play</p>
        </div>
        <div className='face'>
          <div>
            <MrJingles className='jingles' />
            <MrJingles className='jingles-shadow' />
          </div>
        </div>
        <style jsx>{`
          .box {
            position: relative;
            width: 600px;
            height: 315px;
            overflow: hidden;
            font-family: palatino;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: ${barHeight}px ${315 - barHeight}px;
            grid-template-areas:
              "bar"
              "face";

            .name {
              grid-area: bar;
              display: grid;
              grid-template-columns: 360px 240px;
              grid-template-rows: ${barHeight}px;
              grid-template-areas: "name-one name-two";
              z-index: 2;
              box-shadow: 0 5px 30px 3px #333333;
              .name-one, .name-two {
                margin: 0;
                padding: ${pad}px;
                font-size: ${barHeight - (2 * pad)}px;
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
                background: ${colors.textBg};
                color: ${colors.text};
                height: ${barHeight + 5}px;
                border-radius: 0 0 0 5px;
              }
            }
            .face {
              background: ${colors.text} url("/static/bg.svg") no-repeat top left;
              background-size: 100% 100%;
              z-index: 1;
              div {
                grid-area: face;
                position: relative;
                background: ${alpha(colors.textBg, colors.opacity)};
                border-radius: 205px;
                width: 205px;
                height: 205px;
                padding: ${2 * pad}px;
                margin: ${2 * pad}px auto;
              }
            }
          }
        `}</style>
        <style jsx global>{`
          .jingles {
            max-height: 150px;
            z-index: 2;
            transform: translate(-20px, 10px);
            color: ${colors.text};
          }
          .jingles-shadow {
            color: #333333;
            max-height: 140px;
            position: absolute;
            left: 35px;
            top: 35px;
            transform: skew(-10deg, 10deg) translate(-20px, 10px);
            filter: blur(5px);
            z-index: 2;
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' }
]

OgImg.defaultProps = defaultProps(props)
OgImg.propTypes = propTypes(props)

export default OgImg
