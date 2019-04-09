import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import Range from './Range'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import AddIcon from './icons/AddWink'
import prevIcon from './icons/prev'
import playIcon from './icons/play'
import pauseIcon from './icons/pause'
import nextIcon from './icons/next'
import volumeIcon from './icons/volumeHigh'

import alpha from '../helpers/alpha'
import colors from '../styles/colors'
import tfns from '../styles/timing-functions'
import durations from '../styles/durations'

import AppContext from '../features/app/context'
import QueueContext from '../features/queue/context'

function Controls (props) {
  const [showingVolume, setShowingVolume] = useState(false)
  const { state: appState, dispatch: appDispatch } = useContext(AppContext)
  const { dispatch: queueDispatch } = useContext(QueueContext)

  useEffect(() => {
    setShowingVolume(appState.showVolume)
  }, [appState.showVolume])
  return (
    <div
      key='controls'
      className='controls'
    >
      <Range
        key='seek-bar'
        className='seek-bar'
        onChange={props.seekTo}
        current={props.f}
        live
      />

      <div key='controls-buttons' className='controls-buttons'>
        {appState.showWIP ? (
          <React.Fragment>
            <button className='controls-newFile' onClick={props.newFileInput}>
              <AddIcon />
            </button>
            <button
              key='controls-toggleFiles'
              className={`controls-toggleFiles${props.showingFiles ? ' showingFiles' : ''}${props.nbFiles > 0 ? ' hasFiles' : ''}`}
              onClick={props.toggleShowFiles}
            >
              ({props.nbFiles})
            </button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p className='controls-newFile'>&nbsp;&nbsp;&nbsp;&nbsp;</p>
            <p className='controls-toggleFiles'>&nbsp;&nbsp;&nbsp;&nbsp;</p>
          </React.Fragment>
        )}
        <button
          key='controls-prev'
          className='controls-prev'
          onClick={(event) => {
            event.stopPropagation()
            if (props.t < 3) {
              queueDispatch({
                type: 'Queue:prev'
              })
            } else {
              props.restartTrack()
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
            props.togglePlaying()
          }}
        >
          {props.playing
            ? pauseIcon
            : playIcon}
        </button>

        <button
          key='controls-next'
          className='controls-next'
          onClick={(event) => {
            event.stopPropagation()
            queueDispatch({
              type: 'Queue:next'
            })
          }}
        >
          {nextIcon}
        </button>
        <button
          key='controls-toggleFiles-right'
          className={`controls-toggleFiles-right${props.showingFiles ? ' showingFiles' : ''}${props.nbFiles > 0 ? ' hasFiles' : ''}`}
          onClick={props.toggleShowFiles}
        >
          ({props.nbFiles})
        </button>
        <button
          key='controls-volume'
          className='controls-volume'
          onClick={() => {
            appDispatch({ type: 'App:toggleVolume' })
          }}
        >
          {volumeIcon}
        </button>
      </div>
      <div
        className='controls-volume-input'
        data-id={`opacity ${durations.instant} ${tfns.easeInOutQuad}`}
        style={{
          opacity: showingVolume ? 1 : 0,
          transform: showingVolume ? 'translate(0, 0)' : 'translateY(100%, 100%)'
        }}
      >
        <Range
          key='volume'
          className='volume'
          onChange={props.setVolume}
          current={props.volume}
          vertical
          live
        />
      </div>
      <style jsx>{`
        .seek-bar {
          grid-area: seekBar;
          border: 1px solid ${colors.text};
          cursor: pointer;
          background-color: black;
          z-index: 1;
          transition-property: background-color;
          transition-duration: ${durations.moment};

          :global(&.horizontal) {
            width: 100%;
            height: 10px;
            :global(.current) {
              height: 10px;
              transition-property: background-color;
              transition-duration: ${durations.moment};
            }
            :global(.handle) {
              width: 30px;
              height: 30px;
              top: -10px;
              left: -15px;
              background: ${alpha(colors.textBg, 0.4)};
            }
          }
        }
        .volume {
          z-index: 2;
          border: 1px solid ${colors.text};
          background-color: black;
          transition-property: background-color;
          transition-duration: ${durations.moment};
          :global(&.vertical) {
            height: 150px;
            width: 5px;
            margin-left: 22px;
            :global(.current) {
              position: absolute;
              bottom: 0;
              width: 100%;
              background-color: red;
              transition-property: background-color;
              transition-duration: ${durations.moment};
            }
            :global(.handle) {
              bottom: 0;
              left: -23px;
              width: 50px;
              height: 50px;
              background: ${alpha(colors.textBg, 0.4)};
              border-radius: 5px;
              transition-property: opacity;
              transition-duration: ${durations.instant};
              opacity: 0;
            }
          }
        }
        .controls {
          position: fixed;
          z-index: 2;
          bottom: 0;
          left: 0;
          width: 100%;
          font-size: medium;
          /* box-shadow: 0px -2px 5px 0px rgba(0,0,0,0.25); */
        }
        .controls-buttons {
          height: 60px;
          display: grid;
          grid-template-columns: 50px 1fr 50px minmax(50px, 100px) 50px 1fr 50px;
          grid-template-rows: 1fr;
          grid-template-areas:
            "addMedia lspace prev togglePlaying next rspace volume";
          background: #333333;
        }
        .controls button:hover {
          color: ${colors.primaryBg};
        }
        .controls-newFile {
          grid-area: addMedia;
        }
        .controls-toggleFiles {
          border: 3px solid transparent;
          grid-area: lspace;
          justify-self: left;
          opacity: 0;
          transition-property: opacity, background-color;
          transition-duration: ${durations.instant};
          transition-timing-function: ${tfns.easeInOutQuad};
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
          grid-area: rspace;
          justify-self: right;
          opacity: 0;
        }
        .controls-volume {
          grid-area: volume;
        }
        .controls-volume-input {
          position: fixed;
          bottom: 60px;
          right: 1px;
          width: 50px;
          background: #333333;
          cursor: pointer;
          transition-property: opacity, transform;
          transition-duration: ${durations.instant};
          transition-timing-function: ${tfns.easeInOutQuad};
        }
        button, input {
          border: 0;
          background: transparent;
          color: ${colors.textBgEven};
          transition-property: color;
          transition-duration: ${durations.moment};
          cursor: pointer;
        }
        button {
          padding: 10px 5px;
          font-weight: bold;
          appearance: none;
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
    </div>
  )
}

const props = [
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'f', type: PropTypes.number, val: 0 },
  { name: 'history', type: PropTypes.array.isRequired },
  { name: 'upNext', type: PropTypes.array.isRequired },
  { name: 'seekTo', type: PropTypes.func.isRequired },
  { name: 'setVolume', type: PropTypes.func.isRequired },
  { name: 'toggleShowFiles', type: PropTypes.func.isRequired },
  { name: 'newFileInput', type: PropTypes.func.isRequired },
  { name: 'nbFiles', type: PropTypes.number, val: 0 },
  { name: 'showingFiles', type: PropTypes.bool, val: 0 },
  { name: 'showWIP', type: PropTypes.bool, val: false },
  { name: 'showVolume', type: PropTypes.bool, val: false }
]

Controls.defaultProps = defaultProps(props)
Controls.propTypes = propTypes(props)

export default Controls
