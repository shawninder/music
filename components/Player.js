import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import ReactPlayer from 'react-player'

import toUrl from '../helpers/toUrl'
import { IndexedDBPlayer } from './IndexedDBPlayer'
import getFileArt from '../helpers/getFileArt'

ReactPlayer.addCustomPlayer(IndexedDBPlayer)

class Player extends Component {
  render () {
    const classes = this.props.className.split(' ')
    classes.push('Player')
    return (
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
          },
          indexeddb: {
            attributes: {
              poster: getFileArt(this.props.playingNow)
            }
          }
        }}
      />
    )
  }
}

const props = [
  { name: 'playingNow', type: PropTypes.object, val: {} },
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'onRef', type: PropTypes.func.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'onEnded', type: PropTypes.func.isRequired },
  { name: 'className', type: PropTypes.string, val: '' }
]

Player.defaultProps = defaultProps(props)
Player.propTypes = propTypes(props)

export default Player
