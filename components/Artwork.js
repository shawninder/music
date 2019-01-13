import React, { Component } from 'react'
import PropTypes from 'prop-types'

import get from 'lodash.get'
import imgDataToUrl from '../helpers/imgDataToUrl'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Artwork extends Component {
  render () {
    let thumbs = get(this.props.playingNow, 'snippet.thumbnails')
    let src
    if (thumbs) {
      src = get(thumbs, 'high.url') || get(thumbs, 'medium.url') || get(thumbs, 'default.url')
    } else {
      const data = get(this.props.playingNow, 'meta.tags.picture.data')
      if (data) {
        src = imgDataToUrl(data, get(this.props.playingNow, 'meta.tags.picture.format'))
      }
    }
    if (!src) {
      src = 'https://placeholder.pics/svg/640x320/000000-2A2A2A/F1F1F1-000000/%E2%98%86'
    }
    return (
      <React.Fragment>
        <img
          key='artwork'
          src={src}
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'Player:togglePlaying'
            })
          }}
        />
        <style jsx>{`
          img {
            width: 100%;
            max-width: 640px;
            max-height: 360px;
          }
        `}</style>
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
