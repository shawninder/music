import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Track from './Track'

class YouTube extends Component {
  render () {
    let busy = false
    const trackId = this.props.data.key
    const list = this.props.pending[trackId]
    if (list) {
      busy = true
    }
    return (
      <Track
        className='youtube-result'
        data={this.props.data}
        busy={busy}
        artSrc={this.props.data.snippet.thumbnails.default.url}
        dragHandleProps={this.props.dragHandleProps}
        actions={this.props.actions}
        queueIndex={this.props.queueIndex}
        idx={this.props.idx}
        playingNow={this.props.playingNow}
        isPlaying={this.props.isPlaying}
        actionsAbove={this.props.actionsAbove}
        pending={this.props.pending}
      >
        <p className='title'>{this.props.data.snippet.title}</p>
        <p className='channel'>{this.props.data.snippet.channelTitle}</p>
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
