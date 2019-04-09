import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import YouTube from './YouTube'
import AudioFile from './AudioFile'

const options = {
  YouTube,
  AudioFile
}

function Smart (props) {
  let Chosen = options[props.data.type]
  if (!Chosen) {
    let dataStr
    let jsonError
    try {
      dataStr = JSON.stringify(props.data, null, 2)
    } catch (ex) {
      dataStr = props.data.toString()
      jsonError = ex
    }
    throw new Error(`Unknown Smart Component type ${props.data.type}; data: ${dataStr};${jsonError || ''}`)
  }
  return (
    <Chosen
      {...props}
    />
  )
}

const props = [
  { name: 'data', type: PropTypes.object.isRequired }
]

Smart.defaultProps = defaultProps(props)
Smart.propTypes = propTypes(props)

export default Smart
