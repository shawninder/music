import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import AudioFile from './AudioFile'

import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

const isServer = typeof window === 'undefined'

function AudioFileInput (props) {
  const [inputElement, setInputElement] = useState(null)
  const [firstTime, setFirstTime] = useState(true)
  const [nbFiles, setNbFiles] = useState(0)
  useEffect(() => {
    if (firstTime && inputElement && !isServer) {
      inputElement.click()
      setFirstTime(false)
    }
    return () => {
      setInputElement(null)
    }
  }, [inputElement, firstTime])
  function ref (el) {
    setInputElement(el)
    if (inputElement && inputElement.files && inputElement.files.length !== nbFiles) {
      setNbFiles(inputElement.files.length)
    }
  }
  function onCB (event) {
    const target = event.target || event.srcElement
    if (target.value.length === 0) {
      const len = target.files.length
      if (nbFiles === len) {
        props.onCancel(event)
      } else {
        setNbFiles(len)
        props.onFiles([])
      }
    } else {
      setNbFiles(target.files.length)
      props.onFiles(event)
    }
  }
  const classes = props.className ? props.className.split(' ') : []
  if (props.data.hydrated) {
    classes.push('hidden')
  }
  return (
    <AudioFile
      data={props.data}
      dragHandleProps={props.dragHandleProps}
      actions={props.actions}
      queueIndex={props.queueIndex}
      idx={props.idx}
      playingNow={props.playingNow}
      isPlaying={props.isPlaying}
      actionsAbove={props.actionsAbove}
      pending={props.pending}
    >
      <input
        type='file'
        multiple
        className={classes.join(' ')}
        accept='mp3'
        ref={ref}
        onChange={onCB}
        onClick={(event) => {
          event.stopPropagation()
        }}
      />
      <style jsx>{`
        input {
          display: block;
          height: 100%;
          padding: 15px;
          transition-property: opacity;
          transition-duration: ${durations.instant};
          transition-timing-function: ${tfns.easeInOutQuad};
          opacity: 1;
        }
        input.hidden {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          z-index: -1;
          width: 1px;
          height: 1px;
        }
      `}</style>
    </AudioFile>
  )
}

const props = [
  { name: 'data', type: PropTypes.object, val: { meta: { tags: {} } } },
  { name: 'dragHandleProps', type: PropTypes.object, val: {} },
  { name: 'pending', type: PropTypes.object, val: {} },
  { name: 'actions', type: PropTypes.object, val: {} },
  { name: 'idx', type: PropTypes.number, val: -1 },
  { name: 'playingNow', type: PropTypes.string, val: '' },
  { name: 'isPlaying', type: PropTypes.bool, val: false },
  { name: 'queueIndex', type: PropTypes.oneOfType([ PropTypes.number, PropTypes.bool ]), val: false },
  { name: 'actionsAbove', type: PropTypes.bool, val: false },
  { name: 'onFiles', type: PropTypes.func, val: (event) => { console.log('FILES', event.target.files) } },
  { name: 'onCancel', type: PropTypes.func, val: (event) => { console.log('FILES Canceled') } }
]

AudioFileInput.defaultProps = defaultProps(props)
AudioFileInput.propTypes = propTypes(props)

export default AudioFileInput
