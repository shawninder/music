import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultProps, propTypes } from '../helpers'

class PlayingNow extends Component {
  render () {
    return (
      <div
        className='playingNow'
      >
        {this.props.snippet.title}
        {this.props.children}
      </div>
    )
  }
}

const props = [
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

PlayingNow.defaultProps = defaultProps(props)
PlayingNow.propTypes = propTypes(props)

export default PlayingNow
