import React from 'react'
import PropTypes from 'prop-types'

import get from 'lodash.get'
import imgDataToUrl from '../helpers/imgDataToUrl'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

function Artwork (props) {
  let thumbs = get(props.playingNow, 'snippet.thumbnails')
  let src
  if (thumbs) {
    src = get(thumbs, 'high.url') || get(thumbs, 'medium.url') || get(thumbs, 'default.url')
  } else {
    const data = get(props.playingNow, 'meta.tags.picture.data')
    if (data) {
      src = imgDataToUrl(data, get(props.playingNow, 'meta.tags.picture.format'))
    }
  }
  if (!src) {
    src = 'https://placeholder.pics/svg/640x320/000000-2A2A2A/F1F1F1-000000/%E2%98%86'
  }
  return (
    <img
      key='artwork'
      src={src}
      className={props.className}
      onClick={props.onClick}
    />
  )
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'playingNow', type: PropTypes.object.isRequired },
  { name: 'isPlaying', type: PropTypes.bool.isRequired },
  { name: 'onClick', type: PropTypes.func, val: () => {} }
]

Artwork.defaultProps = defaultProps(props)
Artwork.propTypes = propTypes(props)

export default Artwork
