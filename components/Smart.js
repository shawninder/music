import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import YouTube from './YouTube'
import AudioFile from './AudioFile'

const options = {
  YouTube,
  AudioFile
}

class Smart extends Component {
  render () {
    let Chosen = options[this.props.data.type]
    if (!Chosen) {
      throw new Error(`Unknown Smart Component type ${this.props.data.type}; data: ${JSON.stringify(this.props.data, null, 2)}`)
    }
    return (
      <Chosen
        {...this.props}
      />
    )
  }
}

const props = [
  { name: 'data', type: PropTypes.object.isRequired }
]

Smart.defaultProps = defaultProps(props)
Smart.propTypes = propTypes(props)

export default Smart
