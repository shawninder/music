import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class SeekBar extends Component {
  render () {
    const classes = ['seek-bar']
    const playedStyle = {
      width: `${this.props.f * 100}%`
    }
    const handleStyle = {
      marginLeft: `${this.props.f * 100}%`
    }
    return (
      <div className={classes.join(' ')}>
        <div className='seek-bar--played'
          style={playedStyle}
        />
        <div className='seek-bar--handle'
          style={handleStyle}
        />
      </div>
    )
  }
}

const props = [
  { name: 'f', type: PropTypes.number.isRequired }
]

SeekBar.defaultProps = defaultProps(props)
SeekBar.propTypes = propTypes(props)

export default SeekBar
