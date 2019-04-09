import React from 'react'
import PropTypes from 'prop-types'
import unescape from 'lodash.unescape'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Track from './Track'

function YouTube (props) {
  let busy = false
  const trackId = props.data.key
  const list = props.pending[trackId]
  if (list) {
    busy = true
  }
  return (
    <Track
      className='youtube-result'
      data={props.data}
      busy={busy}
      artSrc={props.data.snippet.thumbnails.default.url}
      dragHandleProps={props.dragHandleProps}
      actions={props.actions}
      queueIndex={props.queueIndex}
      idx={props.idx}
      playingNow={props.playingNow}
      isPlaying={props.isPlaying}
      actionsAbove={props.actionsAbove}
      pending={props.pending}
      trackId={trackId}
    >
      <p className='title'>{unescape(props.data.snippet.title)}</p>
      <p className='channel'>{unescape(props.data.snippet.channelTitle)}</p>
      <style jsx>{`
        .title {
          font-size: small;
          font-weight: bold;
        }

        .channel {
          font-size: x-small;
        }

        .title, .channel {
          padding: 5px;
        }
      `}</style>
    </Track>
  )
}

const props = [
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'dragHandleProps', type: PropTypes.object, val: {} },
  { name: 'pending', type: PropTypes.object, val: {} },
  { name: 'actions', type: PropTypes.object, val: {} },
  { name: 'idx', type: PropTypes.number, val: -1 },
  { name: 'playingNow', type: PropTypes.string, val: '' },
  { name: 'isPlaying', type: PropTypes.bool, val: false },
  { name: 'queueIndex', type: PropTypes.oneOfType([ PropTypes.number, PropTypes.bool ]), val: false },
  { name: 'actionsAbove', type: PropTypes.bool, val: false }
]

YouTube.defaultProps = defaultProps(props)
YouTube.propTypes = propTypes(props)

export default YouTube
