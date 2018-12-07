import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import ReactPlayer from 'react-player'

import toUrl from '../helpers/toUrl'
import idbPlayer from './IndexedDBPlayer'

ReactPlayer.addCustomPlayer(idbPlayer)

class Player extends Component {
  render () {
    const classes = ['Player']
    return (
      <div>
        <ReactPlayer
          ref={this.props.onRef}
          className={classes.join(' ')}
          url={this.props.playingNow && this.props.playingNow.key && toUrl(this.props.playingNow)}
          controls
          playing={this.props.playing}
          onPlay={() => {
            this.props.dispatch({
              type: 'Player:setPlaying',
              playing: true
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
              type: 'Player:setPlaying',
              playing: false
            })
          }}
          onDuration={(seconds) => {
            this.props.dispatch({
              type: 'Player:duration',
              seconds
            })
          }}
          onSeek={(seconds) => {
            this.props.dispatch({
              type: 'Player:seek',
              seconds
            })
          }}
          onEnded={this.props.onEnded}
          config={{
            youtube: {
              start: 0
            }
          }}
        />
      </div>
    )
  }
}

const props = [
  { name: 'playingNow', type: PropTypes.object, val: {} },
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'onRef', type: PropTypes.func.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'onEnded', type: PropTypes.func.isRequired }
]

Player.defaultProps = defaultProps(props)
Player.propTypes = propTypes(props)

export default Player
