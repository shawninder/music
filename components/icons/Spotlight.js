import React, { Component } from 'react'

import MrJingles from './Happy'

import colors from '../../styles/colors'

class Spotlight extends Component {
  render () {
    const spotlightWidth = 205
    const spotlightHeight = spotlightWidth
    const mrJinglesWidth = Math.round(0.73 * spotlightWidth)
    const mrJinglesHeight = mrJinglesWidth

    const pad = Math.round(0.1 * spotlightWidth)
    const blur = Math.round(0.02 * spotlightWidth)

    const tx = -Math.round(0.10 * spotlightWidth)
    const txs = -Math.round(0.05 * spotlightWidth)
    const tys = Math.round(0.1 * spotlightWidth)
    const top = Math.round(0.17 * spotlightWidth)
    const left = Math.round(0.20 * spotlightWidth)
    return (
      <div className='spotlight' key='spotlight'>
        <style jsx global>{`
          .jingles, .jingles-shadow {
            width: ${mrJinglesWidth}px;
            height: ${mrJinglesHeight}px;
          }
          .jingles {
            position: relative;
            max-height: ${mrJinglesHeight}px;
            transform: translate(${tx}px);
            color: ${colors.text};
            z-index: 3;
          }
          .jingles-shadow {
            color: #333333;
            max-height: ${Math.round(0.9 * mrJinglesHeight)}px;
            position: absolute;
            left: ${left}px;
            top: ${top}px;
            transform: skew(-10deg, 10deg) translate(${txs}px, ${tys}px);
            filter: blur(${blur}px);
            z-index: 2;
          }
        `}</style>
        <style jsx>{`
          .spotlight {
            grid-area: face;
            position: relative;
            background: ${colors.spotlight};
            border-radius: ${spotlightWidth}px;
            width: ${spotlightWidth}px;
            height: ${spotlightHeight}px;
            padding: ${pad}px;
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
