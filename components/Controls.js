import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import playIcon from './playIcon'
import pauseIcon from './pauseIcon'
import prevIcon from './prevIcon'
import nextIcon from './nextIcon'

class Controls extends Component {
  constructor (props) {
    super(props)
    this.startSeeking = this.startSeeking.bind(this)
    this.followSeek = this.followSeek.bind(this)
    this.endSeek = this.endSeek.bind(this)
    this.state = {
      seeking: false,
      seekingTo: props.f
    }
  }

  startSeeking (event) {
    this.setState({
      seeking: true,
      seekingTo: getSeekTarget(event)
    })
    global.addEventListener('mousemove', this.followSeek, false)
    global.addEventListener('mouseup', this.endSeek, false)
  }

  followSeek (event) {
    // TODO if mouseup happened outside of `global`, detect and end seek
    this.setState({
      seeking: true,
      seekingTo: getSeekTarget(event)
    })
  }

  endSeek (event) {
    global.removeEventListener('mousemove', this.followSeek, false)
    global.removeEventListener('mouseup', this.endSeek, false)
    this.props.seekTo(getSeekTarget(event))
    this.setState({
      seeking: false
    })
  }

  render () {
    return (
      <div
        key='controls'
        className='controls'
      >
        <div key='seek-bar' className='seek-bar' onMouseUp={(event) => {
          this.props.seekTo(getSeekTarget(event))
        }}>
          <div key='seek-bar--played' className='seek-bar--played'
            style={{
              width: `${(this.state.seeking ? this.state.seekingTo : this.props.f) * 100}%`
            }}
          />
          <div key='seek-bar--handle' className='seek-bar--handle'
            style={{
              marginLeft: `${(this.state.seeking ? this.state.seekingTo : this.props.f) * 100}%`
            }}
            onMouseDown={this.startSeeking}
          />
        </div>

        <div className='bug-partial-fix' />
        {/* TODO Fix :p
          The seek-bar somehow ends up with this className ('bug-partial-fix')
          instead of `controls-buttons`, which is marginally better.
        Obviously a better fix is required */}

        <div key='controls-buttons' className='controls-buttons'>
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
            {prevIcon}
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
              ? pauseIcon
              : playIcon}
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
            {nextIcon}
          </button>
        </div>
      </div>
    )
  }
}

const props = [
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'f', type: PropTypes.number, val: 0 },
  { name: 'history', type: PropTypes.array.isRequired },
  { name: 'upNext', type: PropTypes.array.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

Controls.defaultProps = defaultProps(props)
Controls.propTypes = propTypes(props)

export default Controls

function getSeekTarget (event) {
  const x = event.clientX
  const el = event.target
  let width = 1
  // TODO this is really risky, find better way
  if (el.className === 'seek-bar') {
    width = el.offsetWidth
  } else if (el.className === 'seek-bar--played') {
    width = el.parentNode.offsetWidth
  } else if (el.className === 'seek-bar--handle') {
    width = el.parentNode.offsetWidth
  } else {
    let seekbar = global.document.getElementsByClassName('seek-bar')[0]
    width = seekbar.offsetWidth
  }
  return x / width
}
