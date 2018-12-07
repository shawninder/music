import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Range extends Component {
  static makeClassName (className) {
    return `${className} range`
  }
  static makeCurrentClassName (className) {
    return `${className}--current`
  }
  static makeHandleClassName (className) {
    return `${className}--handle`
  }
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
    if (this.ref) {
      this.ref.removeEventListener('touchmove', this.onTouchMove, false)
    }
  }

  startSeeking (event) {
    const value = this.eventValue(event)
    if (this.props.live) {
      this.props.onChange(value)
    }
    this.setState({
      seeking: true,
      seekingTo: value
    })
    global.addEventListener('mousemove', this.followSeek, false)
    global.addEventListener('mouseup', this.endSeek, false)
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
    global.removeEventListener('mouseup', this.endSeek, false)
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
      if (this.ref) {
        this.ref.removeEventListener('touchmove', this.onTouchMove, false)
      }
      this.ref = el
      el.addEventListener('touchmove', this.onTouchMove, false)
    }
  }

  eventValue (event) {
    const pos = this.props.vertical ? event.clientY : event.clientX
    const el = event.target
    let total = 1
    let displacement = 0
    // TODO this is all really risky, find better way
    if (el.className.indexOf(Range.makeClassName(this.props.className)) !== -1) {
      total = this.props.vertical ? el.offsetHeight : el.offsetWidth
      const rect = el.getBoundingClientRect()
      displacement = this.props.vertical ? rect.top : rect.left
    } else if (el.className.indexOf(Range.makeCurrentClassName(this.props.className)) !== -1) {
      total = this.props.vertical ? el.parentNode.offsetHeight : el.parentNode.offsetWidth
      const rect = el.parentNode.getBoundingClientRect()
      displacement = this.props.vertical ? rect.top : rect.left
    } else if (el.className.indexOf(Range.makeHandleClassName(this.props.className)) !== -1) {
      total = this.props.vertical ? el.parentNode.offsetHeight : el.parentNode.offsetWidth
      const rect = el.parentNode.getBoundingClientRect()
      displacement = this.props.vertical ? rect.top : rect.left
    } else {
      let track = global.document.getElementsByClassName(this.props.className)[0]
      total = this.props.vertical ? track.offsetHeight : track.offsetWidth
      const rect = track.getBoundingClientRect()
      displacement = this.props.vertical ? rect.top : rect.left
    }
    const result = (pos - displacement) / total
    return this.props.vertical ? 1 - result : result
  }

  render () {
    const currentPercentage = `${chop(this.props.current, 0, 1) * 100}%`
    const seekToPercentage = `${chop(this.state.seekingTo, 0, 1) * 100}%`
    const handleTarget = this.state.seeking ? seekToPercentage : currentPercentage
    const className = Range.makeClassName(this.props.className)
    const currentClassName = Range.makeCurrentClassName(this.props.className)
    const handleClassName = Range.makeHandleClassName(this.props.className)
    return (
      <div
        className={`${className}${this.state.seeking ? ' seeking' : ''}`}
        onMouseUp={(event) => {
          this.props.onChange(this.eventValue(event))
        }}
        onMouseDown={this.startSeeking}
        ref={this.onRef}
      >
        <div
          className={currentClassName}
          style={this.props.vertical ? {
            height: currentPercentage
          } : {
            width: currentPercentage
          }}
        />
        <div
          className={handleClassName}
          style={this.props.vertical ? {
            bottom: handleTarget
          } : {
            marginLeft: handleTarget
          }}
        />
        <style jsx>{`
          .range {
            position: relative;
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string.isRequired },
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
