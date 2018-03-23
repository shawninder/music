import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultProps, propTypes } from '../srcz/helpers'

import ReactPlayer from 'react-player'

const youtubeUrl = (item) => {
  return `https://www.youtube.com/watch?v=${item.id.videoId}`
}

class Player extends Component {
  render () {
    return (
      <ReactPlayer
        ref={this.props.onRef}
        className="Player"
        url={this.props.playingNow && this.props.playingNow.id && youtubeUrl(this.props.playingNow)}
        controls={true}
        playing={this.props.playing}
        onPlay={() => {
          this.props.dispatch({
            type: 'Player:setPlaying'
          })
        }}
        onProgress={(progress) => {
          this.props.dispatch({
            type: 'Player:progress',
            data: progress
          })
        }}
        onPause={() => {
          this.props.dispatch({
            type: 'Player:setNotPlaying'
          })
        }}
        onEnded={() => {
          this.props.dispatch({
            type: 'Queue:next'
          })
        }}

        style={{
          display: this.props.show ? 'block' : 'none'
        }}
        config={{
          youtube: {
            start: 0
          }
        }}
      />
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'playingNow', type: PropTypes.object.isRequired },
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'onRef', type: PropTypes.func.isRequired },
  { name: 'show', type: PropTypes.bool, val: false }
]

Player.defaultProps = defaultProps(props)
Player.propTypes = propTypes(props)

export default Player
