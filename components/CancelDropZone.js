import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import lengths from '../styles/lengths'
import durations from '../styles/durations'
import colors from '../styles/colors'

class CancelDropZone extends Component {
  render () {
    const classes = this.props.className
      ? this.props.className.split(' ')
      : []
    return (
      <div className={classes.join(' ')}>
        Drop here to cancel
        <style jsx>{`
          .cancelDropZone {
            position: fixed;
            top: 0;
            height: ${lengths.rowHeight};
            width: 100%;
            font-size: large;
            font-weight: bold;
            padding: 5px 160px 5px 60px;
            z-index: 1;
            border: 0;
            color: ${colors.textBg};
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

const props = [
  { name: 'className', type: PropTypes.string, val: '' }
]

CancelDropZone.defaultProps = defaultProps(props)
CancelDropZone.propTypes = propTypes(props)

export default CancelDropZone
