import React, { Component } from 'react'
import PropTypes from 'prop-types'

import get from 'lodash.get'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Artwork extends Component {
  render () {
    const thumbs = get(this.props.playingNow, 'snippet.thumbnails')
    const thumb = thumbs
      ? (thumbs.high || thumbs.medium || thumbs.default)
      : { url: 'https://placeholder.pics/svg/640x320/000000-2A2A2A/F1F1F1-000000/%E2%98%86' }
    return (
      <React.Fragment>
        <img
          key='artwork'
          src={thumb.url}
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'Player:togglePlaying'
            })
          }}
        />
      </React.Fragment>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'playingNow', type: PropTypes.object.isRequired },
  { name: 'isPlaying', type: PropTypes.bool.isRequired }
]

Artwork.defaultProps = defaultProps(props)
Artwork.propTypes = propTypes(props)

export default Artwork
