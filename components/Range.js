import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import durations from '../styles/durations'

class Range extends Component {
  constructor (props) {
    super(props)
    this.startSeeking = this.startSeeking.bind(this)
    this.followSeek = this.followSeek.bind(this)
    this.endSeek = this.endSeek.bind(this)
    this.eventValue = this.eventValue.bind(this)
    this.onRef = this.onRef.bind(this)

    this.state = {
      seeking: false,
      seekingTo: props.current
    }
  }

  componentWillUnmount () {
    if (this.el) {
      this.el.removeEventListener('touchmove', this.onTouchMove, false)
    }
  }

  startSeeking (event) {
    this.followSeek(event)
    global.addEventListener('mousemove', this.followSeek, false)
    global.addEventListener('touchmove', this.followSeek, false)
    global.addEventListener('mouseup', this.endSeek, false)
    global.addEventListener('touchend', this.endSeek, false)
  }

  followSeek (event) {
    // TODO if mouseup happened outside of `global`, detect and end seek
    const value = this.eventValue(event)

    if (this.props.live) {
      this.props.onChange(value)
    }
    this.setState({
      seeking: true,
      seekingTo: value
    })
  }

  endSeek (event) {
    global.removeEventListener('mousemove', this.followSeek, false)
    global.removeEventListener('touchmove', this.followSeek, false)
    global.removeEventListener('mouseup', this.endSeek, false)
    global.removeEventListener('touchend', this.endSeek, false)
    const value = this.eventValue(event)
    this.props.onChange(value)
    this.setState({
      seeking: false,
      seekingTo: value
    })
  }

  onTouchMove (event) {
    event.preventDefault()
  }

  onRef (el) {
    if (el) {
      if (this.el) {
        this.el.removeEventListener('touchmove', this.onTouchMove, false)
      }
      this.el = el
      el.addEventListener('touchmove', this.onTouchMove, false)
    }
  }

  eventValue (event) {
    const touches = (event.touches && event.touches.length > 0)
      ? event.touches
      : null
    const x = (touches) ? touches[0].clientX : event.clientX
    const y = (touches) ? touches[0].clientY : event.clientY
    const pos = this.props.vertical ? y : x
    const el = event.target

    // TODO this is all really risky, find better way
    if (el === this.el) {
      return calcPos(this.props.vertical, el, pos)
    }
    if (el === this.currentEl) {
      return calcPos(this.props.vertical, el.parentNode, pos)
    }
    if (el === this.handleEl) {
      return calcPos(this.props.vertical, el.parentNode, pos)
    } else {
      return calcPos(this.props.vertical, this.el, pos)
    }
  }

  render () {
    const currentPercentage = `${chop(this.props.current, 0, 1) * 100}%`
    const seekToPercentage = `${chop(this.state.seekingTo, 0, 1) * 100}%`
    const handleTarget = this.state.seeking ? seekToPercentage : currentPercentage
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('range')
    if (this.state.seeking) {
      classes.push('seeking')
    }
    if (this.props.vertical) {
      classes.push('vertical')
    } else {
      classes.push('horizontal')
    }
    return (
      <div
        className='container'
        onMouseDown={this.startSeeking}
        onTouchStart={this.startSeeking}
        onMouseUp={this.endSeek}
        onTouchEnd={this.endSeek}
        ref={this.onRef}
      >
        <div className={classes.join(' ')}>
          <div
            className='current'
            style={this.props.vertical ? {
              height: currentPercentage
            } : {
              width: currentPercentage
            }}
            ref={(el) => {
              this.currentEl = el
            }}
          />
          <div
            className='handle'
            style={this.props.vertical ? {
              bottom: handleTarget
            } : {
              marginLeft: handleTarget
            }}
            ref={(el) => {
              this.handleEl = el
            }}
          />
        </div>
        <style jsx>{`
          .container {
            .range {
              position: relative;
              cursor: pointer;
              border: 1px solid black;
              background-color: ${colors.text};
              .handle {
                position: absolute;
                opacity: 0;
                transition-property: opacity;
                transition-duration: ${durations.instant};
                border-radius: 5px;
                border: 1px solid rgba(255, 0, 0, 0.4);
              }
              .current {
                background-color: red;
              }
              &.horizontal {
                .handle {
                  left: -15px;
                }
                .current {
                  height: 100%;
                }
              }
              &.vertical {
                display: inline-block;
                .handle {
                  margin-bottom: -15px;
                  bottom: 0;
                }
                .current {
                  width: 100%;
                  position: absolute;
                  bottom: 0;
                }
              }
              &.seeking {
                .handle {
                  opacity: 1;
                }
              }
            }
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'vertical', type: PropTypes.bool, val: false },
  { name: 'current', type: PropTypes.number.isRequired },
  { name: 'live', type: PropTypes.bool, val: false },
  { name: 'onChange', type: PropTypes.func, val: (value) => { console.log('Range value changed', value) } }
]

Range.defaultProps = defaultProps(props)
Range.propTypes = propTypes(props)

export default Range

function chop (i, min, max) {
  return Math.max(Math.min(max, i), min)
}

function calcPos (isVertical, el, pos) {
  const total = isVertical ? el.offsetHeight : el.offsetWidth
  const rect = el.getBoundingClientRect()
  const displacement = isVertical ? rect.top : rect.left
  const result = (pos - displacement) / total
  return isVertical ? 1 - result : result
}
