import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'

import imgDataToUrl from '../helpers/imgDataToUrl'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import cancelIcon from './icons/cancel'
import moreIcon from './icons/more'

import ActionList from './ActionList'

import style from './Track.style'

function Track (props) {
  const [showingActions, setShowingActions] = useState(false)
  const actionListRef = useRef(null)
  const el = useRef(null)

  function hideActions () {
    setShowingActions(false)
  }
  function showActions () {
    setShowingActions(true)
    global.setTimeout(() => {
      if (actionListRef.current) {
        const li = actionListRef.current.childNodes[0]
        if (li) {
          li.childNodes[0].focus()
        }
      }
    }, 0)
  }
  function toggleActions (event) {
    event.stopPropagation()
    if (showingActions) {
      hideActions()
    } else {
      showActions()
    }
  }
  function onClick (event) {
    if (Object.keys(props.actions).length > 0) {
      showActions()
    }
  }
  function onToggle (event) {
    if (!props.data.inQueue) {
      event.stopPropagation()
      if (!props.playingNow) {
        if (props.actions.play) {
          props.actions.play.go(props.data)
        }
      } else {
        if (props.actions.enqueue) {
          props.actions.enqueue.go(props.data)
        }
      }
    }
  }

  const trackClasses = props.className ? props.className.split(' ') : []
  trackClasses.push('track')
  if (showingActions) {
    trackClasses.push('showingActions')
  }
  const toggleClasses = props.toggleClasses ? props.toggleClasses.split(' ') : []
  toggleClasses.push('toggle')
  if (props.data.inQueue) {
    toggleClasses.push('toggled')
  }
  if (props.busy) {
    toggleClasses.push('busy')
  }
  const actionToggleClasses = ['actionToggle']
  const actionToggleIcon = showingActions ? cancelIcon : moreIcon
  const actionListClasses = ['actions']
  const artSrc = (props.artFormat && props.artData)
    ? imgDataToUrl(props.artData, props.artFormat)
    : props.artSrc
  return (
    <div
      className={trackClasses.join(' ')}
      onClick={onClick}
      key={`track-${props.trackId}`}
      ref={el}
    >
      <div
        className={toggleClasses.join(' ')}
        onClick={onToggle}
      >
        <div className='art'>
          <div className='idx'>
            {props.data.queueIndex === 0 ? '' : props.data.queueIndex}
          </div>
          <img
            className='art-img'
            src={artSrc}
            alt={props.artAlt}
            {...props.dragHandleProps}
          />
        </div>
      </div>
      <div className='body'>
        {props.children}
      </div>
      {Object.keys(props.actions).length > 0 ? (
        <React.Fragment>
          <button
            className={actionToggleClasses.join(' ')}
            onClick={toggleActions}
          >
            {actionToggleIcon}
          </button>
          {showingActions
            ? (
              <ActionList
                className={actionListClasses.join(' ')}
                actions={props.actions}
                data={props.data}
                idx={props.idx}
                showing={showingActions}
                actionsAbove={props.actionsAbove}
                onRef={actionListRef}
                onGo={() => {
                  setShowingActions(false)
                }}
                onDismiss={() => {
                  setShowingActions(false)
                }}
                onBlur={() => {
                  if (el.current) {
                    el.current.parentNode.focus()
                  }
                }}
              />
            ) : null}
        </React.Fragment>
      ) : null}
      <style jsx>{style}</style>
    </div>
  )
}

const props = [
  { name: 'trackId', type: PropTypes.string.isRequired },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'toggleClasses', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'dragHandleProps', type: PropTypes.object, val: {} },
  { name: 'artSrc', type: PropTypes.string, val: 'https://via.placeholder.com/150' },
  { name: 'busy', type: PropTypes.bool, val: false },
  { name: 'actionListRef', type: PropTypes.object, val: {} },
  { name: 'onClick', type: PropTypes.func, val: () => {} },
  { name: 'idx', type: PropTypes.number, val: -1 },
  { name: 'playingNow', type: PropTypes.string, val: '' },
  { name: 'isPlaying', type: PropTypes.bool, val: false },
  { name: 'actionsAbove', type: PropTypes.bool, val: false },
  { name: 'pending', type: PropTypes.object, val: {} }
]

Track.defaultProps = defaultProps(props)
Track.propTypes = propTypes(props)

export default Track
