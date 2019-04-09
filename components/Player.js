import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import ReactPlayer from 'react-player'

import toUrl from '../helpers/toUrl'
import { IndexedDBPlayer } from './IndexedDBPlayer'
import getFileArt from '../helpers/getFileArt'

import lengths from '../styles/lengths'

import PlayerContext from '../features/player/context'

ReactPlayer.addCustomPlayer(IndexedDBPlayer)

function Player (props) {
  const { dispatch } = useContext(PlayerContext)
  const classes = props.className ? props.className.split(' ') : []
  classes.push('Player')
  return (
    <div className={classes.join(' ')}>
      <ReactPlayer
        ref={props.onRef}
        url={props.playingNow && props.playingNow.key && toUrl(props.playingNow)}
        playing={props.playing}
        controls={props.controls}
        onPlay={() => {
          dispatch({
            type: 'Player:setPlaying',
            playing: true
          })
        }}
        onProgress={(progress) => {
          dispatch({
            type: 'Player:progress',
            data: progress
          })
        }}
        onPause={() => {
          dispatch({
            type: 'Player:setPlaying',
            playing: false
          })
        }}
        onDuration={(seconds) => {
          dispatch({
            type: 'Player:duration',
            seconds
          })
        }}
        onSeek={(seconds) => {
          dispatch({
            type: 'Player:seek',
            seconds
          })
        }}
        onEnded={props.onEnded}
        config={{
          youtube: {
            start: 0,
            iv_load_policy: 3
          },
          indexeddb: {
            attributes: {
              poster: getFileArt(props.playingNow)
            }
          }
        }}
        width='100%'
      />
      <style jsx>{`
        .Player {
          z-index: 0;
          max-width: ${lengths.mediaWidth};
          max-height: ${lengths.mediaHeight};
          max-width: 100%;
        }
      `}</style>
    </div>
  )
}

const props = [
  { name: 'playingNow', type: PropTypes.object, val: {} },
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'onRef', type: PropTypes.object.isRequired },
  { name: 'onEnded', type: PropTypes.func.isRequired },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'controls', type: PropTypes.bool, val: false }
]

Player.defaultProps = defaultProps(props)
Player.propTypes = propTypes(props)

export default Player
