import React, { Component } from 'react'

import MrJingles from './Happy'

import colors from '../../styles/colors'

class Spotlight extends Component {
  render () {
    return (
      <div className='spotlight' key='spotlight'>
        <style jsx global>{`
          .jingles {
            max-height: 150px;
            z-index: 2;
            transform: translate(-35px, 10px);
            color: ${colors.text};
          }
          .jingles-shadow {
            color: #333333;
            max-height: 140px;
            position: absolute;
            left: 35px;
            top: 35px;
            transform: skew(-10deg, 10deg) translate(-35px, 10px);
            filter: blur(5px);
            z-index: 2;
          }
        `}</style>
        <style jsx>{`
          .spotlight {
            grid-area: face;
            position: relative;
            background: ${colors.spotlight};
            border-radius: 205px;
            width: 205px;
            height: 205px;
            padding: 20px;
            margin: 0 auto;
          }
        `}</style>
        <MrJingles className='jingles' key='jingles' />
        <MrJingles className='jingles-shadow' key='jingles-shadow' />
      </div>
    )
  }
}

export default Spotlight
