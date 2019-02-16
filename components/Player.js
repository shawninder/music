import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import ReactPlayer from 'react-player'

import toUrl from '../helpers/toUrl'
import { IndexedDBPlayer } from './IndexedDBPlayer'
import getFileArt from '../helpers/getFileArt'

import lengths from '../styles/lengths'

ReactPlayer.addCustomPlayer(IndexedDBPlayer)

class Player extends Component {
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('Player')
    return (
      <div className={classes.join(' ')}>
        <ReactPlayer
          ref={this.props.onRef}
          url={this.props.playingNow && this.props.playingNow.key && toUrl(this.props.playingNow)}
          playing={this.props.playing}
          controls={this.props.controls}
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
              start: 0,
              iv_load_policy: 3
            },
            indexeddb: {
              attributes: {
                poster: getFileArt(this.props.playingNow)
              }
            }
          }}
        />
        <style jsx>{`
          .Player {
            z-index: 0;
            width: ${lengths.mediaWidth};
            height: ${lengths.mediaHeight};
            max-width: 100%;
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'playingNow', type: PropTypes.object, val: {} },
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'onRef', type: PropTypes.func.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'onEnded', type: PropTypes.func.isRequired },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'controls', type: PropTypes.bool, val: false }
]

Player.defaultProps = defaultProps(props)
Player.propTypes = propTypes(props)

export default Player
