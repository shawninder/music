import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash.clonedeep'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import isElementInViewport from '../helpers/isElementInViewport'

import useListeners from '../features/listeners/use'
import useOnViewport from '../features/listeners/useOnViewport'

import styles from './List.style.js'

const HIDDEN = 'hidden'
const SHOWING = 'showing'

const CLOSED = 'closed'
const OPENED = 'opened'

function List (props) {
  const defaultClasses = props.className ? props.className.split(' ') : []
  defaultClasses.push('list')
  const [closed, setClosed] = useState(props.startsCollapsed)
  const [classes, setClasses] = useState(defaultClasses)
  const [dropZoneClasses] = useState(['actual-list'])
  const loader = useRef(null)

  useEffect(() => {
    if (props.hidden) {
      hide()
    } else {
      show()
    }
  }, [props.hidden])

  useEffect(() => {
    if (closed) {
      shut()
    } else {
      open()
    }
  }, [closed])

  useOnViewport(checkLoader)

  const { keyDown } = useListeners({
    'enter': (event) => {
      const idx = getIdx(event)
      if (idx !== -1 && props.onRef.current) {
        event.preventDefault()
        if (props.onItem['enter']) {
          props.onItem['enter'](props.items[idx], idx, event)
        } else {
          event.target.childNodes[0].click()
        }
      }
    },
    'ctrl+enter': (event) => {
      const idx = getIdx(event)
      if (idx !== -1 && props.onRef.current) {
        event.preventDefault()
        if (props.onItem['ctrl+enter']) {
          props.onItem['ctrl+enter'](props.items[idx], idx, event)
        }
      }
    },
    'shift+enter': (event) => {
      const idx = getIdx(event)
      if (idx !== -1 && props.onRef.current) {
        event.preventDefault()
        if (props.onItem['shift+enter']) {
          props.onItem['shift+enter'](props.items[idx], idx, event)
        }
      }
    },
    'ctrl+shift+enter': (event) => {
      const idx = getIdx(event)
      if (idx !== -1 && props.onRef.current) {
        event.preventDefault()
        if (props.onItem['ctrl+shift+enter']) {
          props.onItem['ctrl+shift+enter'](props.items[idx], idx, event)
        }
      }
    },
    'space': (event) => {
      const idx = getIdx(event)
      if (idx !== -1 && props.onRef.current) {
        event.preventDefault()
        if (props.onItem['space']) {
          props.onItem['space'](props.items[idx], idx, event)
        }
      }
    },
    'up': (event) => {
      event.preventDefault()
      const previousSibling = event.target.previousSibling
      if (previousSibling) {
        previousSibling.focus()
      } else {
        props.onUp(event)
      }
    },
    'down': (event) => {
      event.preventDefault()
      const nextSibling = event.target.nextSibling
      if (nextSibling) {
        nextSibling.focus()
        const classStr = event.target.parentNode.getAttribute('class')
        const listClasses = classStr ? classStr.split(' ') : []
        const isLoader = listClasses.includes('loadsMore') && !nextSibling.nextSibling
        if (isLoader) {
          event.target.focus()
          // We don't want to prevent focusing the loader because we want to make sure the browser will scroll it in view, but once that is done, we want the focus immediately back on the last real item of the list. Keeping the focus on the loader would bring focus and the bottom of the list under the new results, out of view.
        }
      }
    }
  })

  function show () {
    setClasses(classes.filter(item => item !== HIDDEN).concat([SHOWING]))
  }

  function hide () {
    setClasses(classes.filter(item => item !== SHOWING).concat([HIDDEN]))
  }

  function open () {
    setClasses(classes.filter(item => item !== CLOSED).concat([OPENED]))
  }

  function shut () {
    setClasses(classes.filter(item => item !== OPENED).concat([CLOSED]))
  }

  function getIdx (event) {
    return Array.prototype.indexOf.call(props.onRef.current.childNodes, event.target)
  }

  function checkLoader (event) {
    if (loader.current) {
      if (props.items.length < props.maxResults && isElementInViewport(loader.current)) {
        props.loadMore()
      }
    }
  }

  function toggleClosed (event) {
    if (props.collapsible) {
      setClosed(!closed)
    }
  }

  const items = props.items.map((item, idx) => {
    const itemClone = cloneDeep(item)
    const Component = itemClone.Component || props.defaultComponent
    if (props.areDraggable) {
      return (
        <Draggable key={`${classes[0]}-list-draggable-${itemClone.key}-${itemClone.queueIndex}`} draggableId={`draggable-${itemClone.key}-${itemClone.queueIndex}`} index={idx}>
          {(draggableProvided, snapshot) => {
            const liClasses = ['list-li']
            if (snapshot.isDragging) {
              liClasses.push('dragging')
            }
            return (
              <li
                key={`${classes[0]}-list-draggable-li-${itemClone.key}`}
                tabIndex='0'
                ref={draggableProvided.innerRef}
                className={liClasses.join(' ')}
                {...draggableProvided.draggableProps}
              >
                <Component
                  data={itemClone}
                  query={props.query ? props.query : undefined}
                  idx={idx}
                  queueIndex={itemClone.queueIndex}
                  dragHandleProps={draggableProvided.dragHandleProps}
                  key={`${classes[0]}-Component-draggable-${itemClone.key}`}
                  {...props.componentProps}
                />
              </li>
            )
          }}
        </Draggable>
      )
    } else {
      return (
        <li
          key={`${classes[0]}-list-nodrag-li-${item.key}`}
          tabIndex='0'
        >
          <Component
            data={item}
            query={props.query ? props.query : undefined}
            idx={idx}
            queueIndex={item.queueIndex}
            key={`${classes[0]}-Component-nodrag-${item.key}`}
            {...props.componentProps}
          />
        </li>
      )
    }
  })
  const loaderContents = props.items.length < props.maxResults ? props.loadingTxt : props.maxReachedTxt
  const loaderFragment = <li className='loader' tabIndex='0' ref={loader}>{loaderContents}</li>
  const dropZone = props.areDraggable
    ? (
      <Droppable droppableId={`droppable-${classes[0]}`} isDropDisabled={props.isDropDisabled}>
        {(droppableProvided, snapshot) => {
          return (
            <ol
              onKeyDown={keyDown}
              onScroll={checkLoader}
              ref={(element) => {
                props.onRef.current = element
                if (droppableProvided) {
                  droppableProvided.innerRef(element)
                }
              }}
              key={`${classes[0]}-list-droppable`}
              className={dropZoneClasses.concat(props.loadsMore ? ['loadsMore'] : []).join(' ')}
            >
              {items}
              {(items.length === 0) ? props.emptyComponent : null}
              {(props.hasMore && items.length > 0) ? loaderFragment : null}
              {droppableProvided.placeholder}
            </ol>
          )
        }}
      </Droppable>
    )
    : (
      <ol
        onKeyDown={keyDown}
        onScroll={checkLoader}
        ref={props.onRef}
        key={`${classes[0]}-list-nodrop`}
        className={dropZoneClasses.join(' ')}
      >
        {items}
        {(items.length === 0) ? props.emptyComponent : null}
        {(props.hasMore && items.length > 0) ? loaderFragment : null}
      </ol>
    )
  return useMemo(() => (
    <div key={`${classes[0]}-list`} className={classes.join(' ')}>
      {/* TODO: handle `props.collapsible && !props.showLabel` */}
      {/* TODO: mode && props.items.length > 0 out of here? */}
      {(props.showLabel && props.hideLabel && props.items.length > 0)
        ? (
          <h3
            onClick={toggleClosed}
          >
            {closed ? props.showLabel : props.hideLabel}
          </h3>
        ) : null
      }
      {closed ? null : dropZone}
      <style jsx>{styles}</style>
      <style>{`
        .loader {
          padding: 12px;
          line-height: 150%;
          cursor: pointer;
          font-size: large;
          border: 0;
        }
      `}</style>
    </div>
  ), [props.items, props.hidden, closed, props.pending, props.componentProps, classes])
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'query', type: PropTypes.string, val: '' },
  { name: 'onUp', type: PropTypes.func, val: () => {} },
  { name: 'onRef', type: PropTypes.object, val: { current: null } },
  { name: 'items', type: PropTypes.array.isRequired },
  { name: 'onItem', type: PropTypes.object, val: {} },
  { name: 'defaultComponent',
    type: PropTypes.func,
    val: (props) => {
      return <pre>{JSON.stringify(props, null, 2)}</pre>
    }
  },
  { name: 'collapsible', type: PropTypes.bool, val: false },
  { name: 'isDropDisabled', type: PropTypes.bool, val: false },
  { name: 'areDraggable', type: PropTypes.bool, val: false },
  { name: 'hasMore', type: PropTypes.bool, val: false },
  { name: 'loadMore', type: PropTypes.func, val: () => {} },
  { name: 'maxResults', type: PropTypes.number, val: 500 },
  { name: 'loadingTxt', type: PropTypes.string, val: 'Loading...' },
  { name: 'maxReachedTxt', type: PropTypes.string, val: 'Please refine your search' },
  { name: 'emptyComponent', type: PropTypes.element, val: <li className='emptyPlaceholder' /> },
  { name: 'hidden', type: PropTypes.bool, val: false },
  { name: 'loadsMore', type: PropTypes.bool, val: false },
  { name: 'componentProps', type: PropTypes.object, val: {} },
  { name: 'startsCollapsed', type: PropTypes.bool, val: false }
]

List.defaultProps = defaultProps(props)
List.propTypes = propTypes(props)

export default List
