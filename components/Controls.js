import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Range from './Range'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import addIcon from './icons/add'
import prevIcon from './icons/prev'
import playIcon from './icons/play'
import pauseIcon from './icons/pause'
import nextIcon from './icons/next'
import volumeIcon from './icons/volumeHigh'

// import controlsCss from '../styles/controls'

class Controls extends Component {
  constructor (props) {
    super(props)
    this.toggleShowingVolume = this.toggleShowingVolume.bind(this)
    this.state = {
      showingVolume: false
    }
    this.inputEl = null
  }

  toggleShowingVolume () {
    this.setState({ showingVolume: !this.state.showingVolume })
  }

  render () {
    return (
      <div
        key='controls'
        className='controls'
      >
        <style jsx>{`
          .controls {
            position: fixed;
            z-index: 1;
            bottom: 0;
            left: 0;
            width: 100%;
            font-size: medium;
            /* background: whitesmoke; */
            /* box-shadow: 0px -2px 5px 0px rgba(0,0,0,0.25); */
          }
          .controls-buttons {
            display: grid;
            grid-template-columns: 50px auto 50px minmax(50px, 100px) 50px auto 50px;
            grid-template-areas:
              "addMedia lspace prev togglePlaying next rspace volume";
            background: #333333;
          }
          .controls-buttons button svg {
            width: 20px;
          }
          .controls button:hover {
            color: steelblue;
          }
          .controls-newFile {
            grid-area: addMedia;
            position: relative;
            font-size: xx-large;
            width: 100%;
            padding: 10px;
          }
          .controls-toggleFiles {
            border: 3px solid transparent;
            grid-aread: lspace;
            justify-self: left;
            opacity: 0;
            transition-property: opacity, background-color;
            transition-duration: 0.2s;
            transition-timing-function: var(--ease-in-out-quint);
          }
          .controls-toggleFiles.showingFiles {
            border-top-color: #666666;
          }
          .controls-toggleFiles.hasFiles {
            opacity: 1;
          }
          .controls-prev {
            grid-area: prev;
          }
          .controls-togglePlaying {
            grid-area: togglePlaying;
          }
          .controls-next {
            grid-area: next;
          }
          .controls-toggleFiles-right {
            grid-aread: rspace;
            justify-self: right;
            opacity: 0;
          }
          .controls-volume {
            grid-area: volume;
          }
          .controls-volume-input.hidden {
            display: none;
          }
          .controls-volume-input {
            position: fixed;
            bottom: 60px;
            right: 1px;
            width: 50px;
            background: #333333;
          }
          button, input {
            border: 0;
            background: transparent;
            color: whitesmoke;
            transition-property: color;
            transition-duration: 0.5s;
            cursor: pointer;
          }
          button {
            padding: 10px 7px;
            font-weight: bold;
            -webkit-appearance: none;
            -moz-appearance: none;
          }
          button:focus {
            outline: none;
          }
          input[type=file] {
            z-index: -1;
            opacity: 0;
            position: absolute;
            top: 0;
            left: 0;
            width: 0.1px;
            height: 0.1px;
          }
        `}</style>
        <style global jsx>{`
          .seek-bar {
            grid-area: seekBar;
            border: 1px solid #333333;
            cursor: pointer;
            background-color: black;
            transition-property: background-color;
            transition-duration: 0.5s;
            z-index: 1;
          }
          .seek-bar--current {
            height: 10px;
            background-color: red;
            transition-property: background-color;
            transition-duration: 0.5s;
          }
          .seek-bar--handle {
            width: 30px;
            height: 30px;
            background: rgba(255, 0, 0, 0.4);
            border-radius: 5px;
            position: absolute;
            top: -10px;
            left: -15px;
            transition-property: opacity;
            transition-duration: 0.1s;
            opacity: 0;
          }
          .seek-bar.seeking .seek-bar--handle {
            opacity: 1;
          }
          .volume {
            border: 1px solid #333333;
            height: 150px;
            width: 5px;
            margin-left: 22px;
            cursor: pointer;
            background-color: black;
            transition-property: background-color;
            transition-duration: 0.5s;
          }
          .volume--current {
            position: absolute;
            bottom: 0;
            width: 100%;
            background-color: red;
            transition-property: background-color;
            transition-duration: 0.5s;
          }
          .volume--handle {
            position: absolute;
            bottom: 0;
            left: -23px;
            width: 50px;
            height: 50px;
            margin-bottom: -15px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 5px;
            transition-property: opacity;
            transition-duration: 0.1s;
            opacity: 0;
          }
          .volume.seeking .volume--handle {
            opacity: 1
          }
        `}</style>
        <Range
          key='seek-bar'
          className='seek-bar'
          onChange={this.props.seekTo}
          current={this.props.f}
          live
        />

        <div key='controls-buttons' className='controls-buttons'>
          <button className='controls-newFile' onClick={this.props.newFileInput}>
            {addIcon}
          </button>
          <button
            key='controls-toggleFiles'
            className={`controls-toggleFiles${this.props.showingFiles ? ' showingFiles' : ''}${this.props.nbFiles > 0 ? ' hasFiles' : ''}`}
            onClick={this.props.toggleShowFiles}
          >
            ({this.props.nbFiles})
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
          <button
            key='controls-toggleFiles-right'
            className={`controls-toggleFiles-right${this.props.showingFiles ? ' showingFiles' : ''}${this.props.nbFiles > 0 ? ' hasFiles' : ''}`}
            onClick={this.props.toggleShowFiles}
          >
            ({this.props.nbFiles})
          </button>
          <button
            key='controls-volume'
            className='controls-volume'
            onClick={this.toggleShowingVolume}
          >
            {volumeIcon}
          </button>
        </div>
        <div className={`controls-volume-input ${this.state.showingVolume ? 'showing' : 'hidden'}`}>
          <Range
            key='volume'
            className='volume'
            onChange={this.props.setVolume}
            current={this.props.volume}
            vertical
            live
          />
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
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'seekTo', type: PropTypes.func.isRequired },
  { name: 'setVolume', type: PropTypes.func.isRequired },
  { name: 'toggleShowFiles', type: PropTypes.func.isRequired },
  { name: 'newFileInput', type: PropTypes.func.isRequired },
  { name: 'nbFiles', type: PropTypes.number, val: 0 },
  { name: 'showingFiles', type: PropTypes.bool, val: 0 }
]

Controls.defaultProps = defaultProps(props)
Controls.propTypes = propTypes(props)

export default Controls
