import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultProps, propTypes } from '../srcz/helpers'
import SeekBar from './SeekBar'
import actionable from './actionable'
import show from '../srcz/mixins/show'
import remember from '../srcz/mixins/remember'
import YouTubeVideo from './YouTubeVideo'

class Controls extends Component {
  render () {
    const playingNow = this.props.playingNow
    let PlayingNowItem = YouTubeVideo
    PlayingNowItem = actionable(PlayingNowItem, {
      txt: 'toggle playback',
      className: 'togglePlaybackButton',
      go: (data, dispatch) => {
        return () => {
          dispatch({
            type: 'Player:togglePlay'
          })
        }
      }
    }, [
      show(this.props.showPlayer),
      remember(this.props.collection)
    ])

    return (
      <div
        className="controls"
      >
        {
          playingNow && playingNow.id
            ? (
              <PlayingNowItem
                className="playingNow"
                data={playingNow}
                dispatch={this.props.dispatch}
              />
            )
            : null
        }

        <SeekBar
          f={this.props.f}
        />

        <button
          className="toggleHistory"
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'History:toggle'
            })
          }}
        >
          ({this.props.history.length})
        </button>

        <button
          className="prev"
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'Queue:prev'
            })
          }}
        >
          &lt;
        </button>

        <button
          className="togglePlay"
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'Player:togglePlay'
            })
          }}
        >
          {this.props.playing ? '||' : '>'}
        </button>

        <button
          className="next"
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'Queue:next'
            })
          }}
        >
          &gt;
        </button>

        <button
          className="toggleUpNext"
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'UpNext:toggle'
            })
          }}
        >
          ({this.props.upNext.length})
        </button>
      </div>
    );
  }
}

const props = [
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'playingNow', type: PropTypes.object.isRequired },
  { name: 'f', type: PropTypes.number, val: 0 },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'history', type: PropTypes.array.isRequired },
  { name: 'upNext', type: PropTypes.array.isRequired },
  { name: 'showPlayer', type: PropTypes.bool.isRequired }
]

Controls.defaultProps = defaultProps(props)
Controls.propTypes = propTypes(props)

export default Controls
