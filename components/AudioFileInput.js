import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import AudioFile from './AudioFile'

import tfns from '../styles/timing-functions'

const isServer = typeof window === 'undefined'

class AudioFileInput extends Component {
  constructor (props) {
    super(props)
    this.onCB = this.onCB.bind(this)
    this.ref = this.ref.bind(this)
    this.el = null
    this.firstTime = true
    this.nbFiles = 0
  }
  componentDidMount () {
    if (this.firstTime && this.el && !isServer) {
      setTimeout(() => {
        this.el.click()
      })
      this.firstTime = false
    }
  }
  componentWillUnmount () {
    this.el = null
  }
  ref (el) {
    this.el = el
    if (el && el.files && el.files.length !== this.nbFiles) {
      this.nbFiles = el.files.length
    }
  }
  onCB (event) {
    const target = event.target || event.srcElement
    if (target.value.length === 0) {
      const len = target.files.length
      if (this.nbFiles === len) {
        this.props.onCancel(event)
      } else {
        this.nbFiles = len
        this.props.onFiles([])
      }
    } else {
      this.nbFiles = target.files.length
      this.props.onFiles(event)
    }
  }
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    if (this.props.data.hydrated) {
      classes.push('hidden')
    }
    return (
      <AudioFile
        data={this.props.data}
        dragHandleProps={this.props.dragHandleProps}
        actions={this.props.actions}
        queueIndex={this.props.queueIndex}
        idx={this.props.idx}
        playingNow={this.props.playingNow}
        isPlaying={this.props.isPlaying}
        actionsAbove={this.props.actionsAbove}
        pending={this.props.pending}
      >
        <input
          type='file'
          multiple
          className={classes.join(' ')}
          accept='mp3'
          ref={this.ref}
          onChange={this.onCB}
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
            transition-duration: 0.2s;
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
