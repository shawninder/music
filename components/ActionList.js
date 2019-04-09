import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Action from './Action'

import style from './ActionList.style'

import passiveSupported from '../helpers/passiveSupported'

const listenerOptions = passiveSupported ? { passive: true, capture: false } : false

const isServer = typeof window === 'undefined'

const HIDDEN = 'hidden'
const SHOWING = 'showing'

function ActionList (props) {
  const defaultClasses = props.className ? props.className.split(' ') : []
  defaultClasses.push('action-list')
  defaultClasses.push(HIDDEN)
  defaultClasses.push(props.actionsAbove
    ? 'above'
    : 'below')
  const [classes, setClasses] = useState(defaultClasses)

  function show () {
    setClasses(classes.filter(item => item !== HIDDEN).concat([SHOWING]))
  }

  function hide () {
    setClasses(classes.filter(item => item !== SHOWING).concat([HIDDEN]))
  }

  useEffect(() => {
    const tid = global.setTimeout(show, 10)
    return () => {
      global.clearTimeout(tid)
    }
  }, [])
  useEffect(() => {
    let tid = null
    function onClickOutside (event) {
      if (!props.onRef.current.contains(event.target)) {
        hide()
        tid = global.setTimeout(props.onDismiss, 100)
      }
    }
    if (!isServer) {
      global.document.addEventListener('click', onClickOutside, listenerOptions)
      return () => {
        global.document.removeEventListener('click', onClickOutside, listenerOptions)
        if (tid) {
          global.clearTimeout(tid)
        }
      }
    }
  }, [])

  function go (action, event) {
    props.onGo()
    return action.go(props.data, props.idx, props.data.queueIndex, event)
  }

  const actions = Object.keys(props.actions).reduce((arr, key, idx) => {
    const action = props.actions[key]
    if (!action.cdn || action.cdn(props.data.queueIndex)) {
      arr.push(
        <li key={key}>
          <Action
            on={{
              click: (event) => {
                props.onBlur()
                return go(action, event)
              },
              esc: (event) => {
                event.stopPropagation()
                props.onDismiss()
                props.onBlur()
              },
              enter: (event) => {
                props.onBlur()
                return go(action, event)
              },
              up: (event) => {
                event.preventDefault()
                const previousSibling = event.target.parentNode.previousSibling
                if (previousSibling) {
                  previousSibling.childNodes[0].focus()
                }
              },
              down: (event) => {
                event.preventDefault()
                const nextSibling = event.target.parentNode.nextSibling
                if (nextSibling) {
                  nextSibling.childNodes[0].focus()
                }
              }
            }}
            txt={action.txt}
            icon={action.icon}
            targetIdx={action.targetIdx}
          />
        </li>
      )
    }
    return arr
  }, [])
  return (
    <>
      <ul
        className={classes.join(' ')}
        ref={props.onRef}
      >
        {actions.length > 0 ? actions : null}
      </ul>
      <style jsx>{style}</style>
    </>
  )
}

const props = [
  { name: 'actions', type: PropTypes.object.isRequired },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'showing', type: PropTypes.bool, val: false },
  { name: 'onRef', type: PropTypes.object, val: React.createRef() },
  { name: 'idx', type: PropTypes.number, val: -1 },
  { name: 'onGo', type: PropTypes.func, val: () => {} },
  { name: 'onDismiss', type: PropTypes.func, val: () => {} },
  { name: 'onBlur', type: PropTypes.func, val: () => {} },
  { name: 'actionsAbove', type: PropTypes.bool, val: false }
]

ActionList.defaultProps = defaultProps(props)
ActionList.propTypes = propTypes(props)

export default ActionList
