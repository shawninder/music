import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Track from './Track'

import get from 'lodash.get'
import cleanFakePath from '../helpers/cleanFakePath'

function AudioFile (props) {
  const classes = props.className ? props.className.split(' ') : []
  classes.push('inputFile')
  let busy = false
  const trackId = props.data.key
  const list = props.pending[trackId]
  if (list) {
    busy = true
  }
  const title = get(props.data, 'meta.tags.title', '')
  const artist = get(props.data, 'meta.tags.artist', '')
  return (
    <Track
      className={classes.join(' ')}
      data={props.data}
      busy={busy}
      artFormat={get(props.data, 'meta.tags.picture.format')}
      artData={get(props.data, 'meta.tags.picture.data')}
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
      <React.Fragment>
        {!title ? (
          <p className='uri'>{cleanFakePath(props.data.fakePath || '')}</p>
        ) : null}
        {title ? (
          <p className='title'>{title}</p>
        ) : null}
        {artist ? (
          <p className='artist'>{artist}</p>
        ) : null}
        {props.children}
        <style jsx>{`
          .title, .artist, .uri {
            padding: 5px;
          }

          .title, .uri {
            font-size: small;
            font-weight: bold;
          }

          .artist {
            font-size: x-small;
          }

          .uri {
            padding-top: 15px;
            text-align: center;
          }
        `}</style>
      </React.Fragment>
    </Track>
  )
}

const props = [
  { name: 'data', type: PropTypes.object, val: { meta: { tags: {} } } },
  { name: 'dragHandleProps', type: PropTypes.object, val: {} },
  { name: 'pending', type: PropTypes.object, val: {} },
  { name: 'actions', type: PropTypes.object, val: {} },
  { name: 'idx', type: PropTypes.number, val: -1 },
  { name: 'playingNow', type: PropTypes.string, val: '' },
  { name: 'isPlaying', type: PropTypes.bool, val: false },
  { name: 'queueIndex', type: PropTypes.oneOfType([ PropTypes.number, PropTypes.bool ]), val: false },
  { name: 'actionsAbove', type: PropTypes.bool, val: false },
  { name: 'className', type: PropTypes.string, val: '' }
]

AudioFile.defaultProps = defaultProps(props)
AudioFile.propTypes = propTypes(props)

export default AudioFile
