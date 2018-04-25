import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import SeekBar from './SeekBar'
// import actionable from './actionable'
// import show from '../mixins/show'
// import remember from '../mixins/remember'
// import YouTubeVideo from './YouTubeVideo'

class Controls extends Component {
  render () {
    const playingNow = this.props.playingNow

    return (
      <div
        className='controls'
      >
        {
          playingNow && playingNow.data && playingNow.data.id
            ? (
              <this.props.PlayingNowComponent
                className='playingNow'
                data={playingNow}
              />
            )
            : null
        }

        <SeekBar
          f={this.props.f}
        />

        <button
          className='prev'
          onClick={(event) => {
            event.stopPropagation()
            if (this.props.t < 3) {
              this.props.dispatch({
                type: 'Queue:prev'
              })
            } else {
              this.props.restartTrack()
            }
          }}
        >
          &lt;
        </button>

        <button
          className='togglePlaying'
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'Player:togglePlaying'
            })
          }}
        >
          {this.props.playing ? '||' : '>'}
        </button>

        <button
          className='next'
          onClick={(event) => {
            event.stopPropagation()
            this.props.dispatch({
              type: 'Queue:next'
            })
          }}
        >
          &gt;
        </button>
      </div>
    )
  }
}

const props = [
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'playingNow', type: PropTypes.object.isRequired },
  { name: 'PlayingNowComponent', type: PropTypes.func.isRequired },
  { name: 'f', type: PropTypes.number, val: 0 },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'showPlayer', type: PropTypes.bool.isRequired }
]

Controls.defaultProps = defaultProps(props)
Controls.propTypes = propTypes(props)

export default Controls
