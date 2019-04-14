import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import durations from '../styles/durations'

import passiveSupported from '../helpers/passiveSupported'

const listenerOptions = passiveSupported ? { passive: true, capture: false } : false

function Range (props) {
  const [seeking, setSeeking] = useState(false)
  const [seekingTo, setSeekingTo] = useState(props.current)
  const container = useRef(null)
  const currentEl = useRef(null)
  const handleEl = useRef(null)

  useEffect(() => {
    if (container.current) {
      container.current.addEventListener('touchmove', onTouchMove, listenerOptions)
      return () => {
        if (container.current) {
          container.current.removeEventListener('touchmove', onTouchMove, listenerOptions)
        }
      }
    }
  })

  function startSeeking (event) {
    followSeek(event)
    global.addEventListener('mousemove', followSeek, listenerOptions)
    global.addEventListener('touchmove', followSeek, listenerOptions)
    global.addEventListener('mouseup', endSeek, listenerOptions)
    global.addEventListener('touchend', endSeek, listenerOptions)
  }

  function followSeek (event) {
    // TODO if mouseup happened outside of `global`, detect and end seek
    const value = eventValue(event)

    if (value) {
      if (props.live) {
        props.onChange(value)
      }
      setSeeking(true)
      setSeekingTo(value)
    }
  }

  function endSeek (event) {
    global.removeEventListener('mousemove', followSeek, listenerOptions)
    global.removeEventListener('touchmove', followSeek, listenerOptions)
    global.removeEventListener('mouseup', endSeek, listenerOptions)
    global.removeEventListener('touchend', endSeek, listenerOptions)
    const value = eventValue(event)
    if (value) {
      props.onChange(value)
      setSeeking(false)
      setSeekingTo(value)
    }
  }

  function onTouchMove (event) {
    event.preventDefault()
  }

  function eventValue (event) {
    const touches = (event.touches && event.touches.length > 0)
      ? event.touches
      : null
    const x = (touches) ? touches[0].clientX : event.clientX
    const y = (touches) ? touches[0].clientY : event.clientY
    const pos = props.vertical ? y : x
    const el = event.target

    // TODO this is all really risky, find better way
    if (el === container.current) {
      return calcPos(props.vertical, el, pos)
    }
    if (el === currentEl.current) {
      return calcPos(props.vertical, el.parentNode, pos)
    }
    if (el === handleEl.current) {
      return calcPos(props.vertical, el.parentNode, pos)
    } else {
      return calcPos(props.vertical, el, pos)
    }
  }

  const currentPercentage = `${chop(props.current, 0, 1) * 100}%`
  const seekToPercentage = `${chop(seekingTo, 0, 1) * 100}%`
  const handleTarget = seeking ? seekToPercentage : currentPercentage
  const classes = props.className ? props.className.split(' ') : []
  classes.push('range')
  if (seeking) {
    classes.push('seeking')
  }
  if (props.vertical) {
    classes.push('vertical')
  } else {
    classes.push('horizontal')
  }
  return (
    <div
      className='container'
      onMouseDown={startSeeking}
      onTouchStart={startSeeking}
      onMouseUp={endSeek}
      onTouchEnd={endSeek}
      ref={container}
    >
      <div className={classes.join(' ')}>
        <div
          className='current'
          style={props.vertical ? {
            height: currentPercentage
          } : {
            width: currentPercentage
          }}
          ref={currentEl}
        />
        <div
          className='handle'
          style={props.vertical ? {
            bottom: handleTarget
          } : {
            marginLeft: handleTarget
          }}
          ref={handleEl}
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
