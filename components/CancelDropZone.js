import React, { Component } from 'react'

import lengths from '../styles/lengths'
import durations from '../styles/durations'
import colors from '../styles/colors'

class CancelDropZone extends Component {
  render () {
    return (
      <div className='cancelDropZone'>
        Drop here to cancel
        <style jsx>{`
          .cancelDropZone {
            position: fixed;
            top: 0;
            height: ${lengths.rowHeight};
            width: 100%;
            font-size: large;
            font-weight: bold;
            padding: 5px 80px 5px 60px;
            z-index: 1;
            border: 0;
            color: ${colors.white};
            background: rgba(254, 70, 70, 0.8);
            border-radius: 0;
            transition-property: opacity;
            transition-duration: ${durations.moment};
            line-height: 2em;
            text-align: center;
            opacity: 0;
          }
        `}</style>
      </div>
    )
  }
}
export default CancelDropZone
