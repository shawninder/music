import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Controls extends Component {
  render () {
    const playingNow = this.props.playingNow

    return (
      <div
        key='controls'
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

        <div key='seek-bar' className='seek-bar'>
          <div key='seek-bar--played' className='seek-bar--played'
            style={{
              width: `${this.props.f * 100}%`
            }}
          />
          <div key='seek-bar--handle' className='seek-bar--handle'
            style={{
              marginLeft: `${this.props.f * 100}%`
            }}
          />
        </div>

        <div className='bug-partial-fix' />
        {/* TODO Fix :p
          The seek-bar somehow ends up with this className ('bug-partial-fix')
          instead of `controls-buttons`, which is marginally better.
        Obviously a better fix is required */}

        <div key='controls-buttons' className='controls-buttons'>
          <button
            key='controls-history'
            className='controls-history'
            onClick={this.props.toggleShowHistory}
          >
            {this.props.history.length}
          </button>

          <button
            key='controls-prev'
            className='controls-prev'
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
            <img src='/static/prev.svg' alt='prev' title='prev' className='icon' />
          </button>

          <button
            key='controls-togglePlaying'
            className='controls-togglePlaying'
            onClick={(event) => {
              event.stopPropagation()
              this.props.dispatch({
                type: 'Player:togglePlaying'
              })
            }}
          >
            {this.props.playing
              ? (
                <img src='/static/pause.svg' alt='pause' title='pause' className='icon' />
              )
              : (
                <img src='/static/play.svg' alt='play' title='play' className='icon' />
              )}
          </button>

          <button
            key='controls-next'
            className='controls-next'
            onClick={(event) => {
              event.stopPropagation()
              this.props.dispatch({
                type: 'Queue:next'
              })
            }}
          >
            <img src='/static/next.svg' alt='next' title='next' className='icon' />
          </button>

          <button
            key='controls-upNext'
            className='controls-upNext'
            onClick={this.props.toggleShowUpNext}
          >
            {this.props.upNext.length}
          </button>
        </div>
      </div>
    )
  }
}

const props = [
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'playingNow', type: PropTypes.object.isRequired },
  { name: 'PlayingNowComponent', type: PropTypes.func.isRequired },
  { name: 'f', type: PropTypes.number, val: 0 },
  { name: 'history', type: PropTypes.array.isRequired },
  { name: 'upNext', type: PropTypes.array.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'showPlayer', type: PropTypes.bool.isRequired },
  { name: 'toggleShowHistory', type: PropTypes.func.isRequired },
  { name: 'toggleShowUpNext', type: PropTypes.func.isRequired }
]

Controls.defaultProps = defaultProps(props)
Controls.propTypes = propTypes(props)

export default Controls
