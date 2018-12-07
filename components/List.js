import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash.isequal'
import cloneDeep from 'lodash.clonedeep'
import deepEqual from 'deep-equal'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import { Droppable, Draggable } from 'react-beautiful-dnd'

const isServer = typeof window === 'undefined'

class List extends Component {
  constructor (props) {
    super(props)
    this.keyDown = this.keyDown.bind(this)
    this.toggleCollapsed = this.toggleCollapsed.bind(this)

    this.state = {
      collapsed: props.startsCollapsed
    }
    this.previousItems = {}
    this.previousCollapsed = {}
    this.previousPending = {}
    this.previousComponentProps = {}
    this.checkLoader = this.checkLoader.bind(this)
    this.loader = null
  }

  componentDidMount () {
    if (!isServer) {
      // see https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
      if (global.addEventListener) {
        global.addEventListener('load', this.checkLoader, false)
        global.addEventListener('DOMContentLoaded', this.checkLoader, false)
        global.addEventListener('load', this.checkLoader, false)
        global.addEventListener('scroll', this.checkLoader, false)
        global.addEventListener('resize', this.checkLoader, false)
      } else if (global.attachEvent) {
        global.attachEvent('load', this.checkLoader)
        global.attachEvent('onDOMContentLoaded', this.checkLoader)
        global.attachEvent('onload', this.checkLoader)
        global.attachEvent('onscroll', this.checkLoader)
        global.attachEvent('onresize', this.checkLoader)
      }
    }
  }

  componentWillUnmount () {
    if (!isServer) {
      // see https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
      if (global.removeEventListener) {
        global.removeEventListener('load', this.checkLoader, false)
        global.removeEventListener('DOMContentLoaded', this.checkLoader, false)
        global.removeEventListener('load', this.checkLoader, false)
        global.removeEventListener('scroll', this.checkLoader, false)
        global.removeEventListener('resize', this.checkLoader, false)
      } else if (global.detachEvent) {
        global.detachEvent('load', this.checkLoader)
        global.detachEvent('onDOMContentLoaded', this.checkLoader)
        global.detachEvent('onload', this.checkLoader)
        global.detachEvent('onscroll', this.checkLoader)
        global.detachEvent('onresize', this.checkLoader)
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!isEqual(this.previousCollapsed, nextState.collapsed) ||
      !isEqual(this.previousItems, nextProps.items) ||
      !deepEqual(this.previousComponentProps, nextProps.componentProps)
    ) {
      this.previousItems = nextProps.items
      this.previousCollapsed = nextState.collapsed
      this.previousComponentProps = nextProps.componentProps
      return true
    }
    return false
  }

  checkLoader (event) {
    if (this.loader) {
      if (this.props.items.length < this.props.maxResults && isElementInViewport(this.loader)) {
        this.props.loadMore()
      }
    }
  }

  keyDown (items) {
    return (event) => {
      const idx = Array.prototype.indexOf.call(this.el.childNodes, event.target)
      if (idx !== -1 && this.el) {
        const item = items[idx]
        if (event.keyCode === 13 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey
        ) { // enter
          if (this.props.onItem['enter']) {
            event.preventDefault()
            this.props.onItem['enter'](item, idx, event)
          } else { // default enter => click
            event.preventDefault()
            event.target.childNodes[0].click()
          }
        }
        if (this.props.onItem['ctrl+enter'] &&
          event.keyCode === 13 &&
          !event.metaKey &&
          event.ctrlKey &&
          !event.shiftKey
        ) { // ctrl+enter
          event.preventDefault()
          this.props.onItem['ctrl+enter'](item, idx, event)
        }
        if (this.props.onItem['shift+enter'] &&
          event.keyCode === 13 &&
          !event.metaKey &&
          !event.ctrlKey &&
          event.shiftKey
        ) { // shift+enter
          event.preventDefault()
          this.props.onItem['shift+enter'](item, idx, event)
        }
        if (this.props.onItem['ctrl+shift+enter'] &&
          event.keyCode === 13 &&
          !event.metaKey &&
          event.ctrlKey &&
          event.shiftKey
        ) { // ctrl+shift+enter
          event.preventDefault()
          this.props.onItem['ctrl+shift+enter'](item, idx, event)
        }
        if (this.props.onItem['space'] &&
          event.keyCode === 32 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey
        ) { // space
          event.preventDefault()
          this.props.onItem['space'](item, idx, event)
        }
      }
      if (event.keyCode === 38) { // up
        event.preventDefault()
        const previousSibling = event.target.previousSibling
        if (previousSibling) {
          previousSibling.focus()
        } else {
          this.props.onUp(event)
        }
      }
      if (event.keyCode === 40) { // down
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
    }
  }

  toggleCollapsed (event) {
    if (this.props.collapsible) {
      this.setState({ collapsed: !this.state.collapsed })
    }
  }

  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('list')
    classes.push(this.state.collapsed ? 'collapsed' : 'not-collapsed')
    if (this.props.hidden) {
      classes.push('hidden')
    }
    const items = this.props.items.map((item, idx) => {
      const itemClone = cloneDeep(item)
      const Component = itemClone.Component || this.props.defaultComponent
      if (this.props.areDraggable) {
        return (
          <Draggable key={`${classes[0]}-list-draggable-${itemClone.key}`} draggableId={`draggable-${itemClone.key}`} index={idx}>
            {(draggableProvided, snapshot) => {
              return (
                <li
                  key={`${classes[0]}-list-draggable-li-${itemClone.key}`}
                  tabIndex='0'
                  ref={draggableProvided.innerRef}
                  className={snapshot.isDragging ? 'dragging' : ''}
                  {...draggableProvided.draggableProps}
                >
                  <Component
                    data={itemClone}
                    query={this.props.query}
                    idx={idx}
                    queueIndex={itemClone.queueIndex}
                    dragHandleProps={draggableProvided.dragHandleProps}
                    key={`${classes[0]}-Component-draggable-${itemClone.key}`}
                    {...this.props.componentProps}
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
              query={this.props.query}
              idx={idx}
              queueIndex={item.queueIndex}
              key={`${classes[0]}-Component-nodrag-${item.key}`}
              {...this.props.componentProps}
            />
          </li>
        )
      }
    })
    const loaderContents = this.props.items.length < this.props.maxResults ? this.props.loadingTxt : this.props.maxReachedTxt
    const loader = <li className='loader' tabIndex='0' ref={(el) => { this.loader = el; this.checkLoader() }}>{loaderContents}</li>
    const dropZone = this.props.areDraggable
      ? (
        <Droppable droppableId={`droppable-${classes[0]}`} isDropDisabled={this.props.isDropDisabled}>
          {(droppableProvided, snapshot) => {
            return (
              <ol
                onKeyDown={this.keyDown(this.props.items)}
                onScroll={this.checkLoader}
                ref={(el) => {
                  this.el = el
                  this.props.onRef(el)
                  return droppableProvided.innerRef(el)
                }}
                key={`${classes[0]}-list-droppable`}
                className={this.props.loadsMore ? 'loadsMore' : ''}
              >
                {items}
                {(items.length === 0) ? this.props.empty : null}
                {(this.props.hasMore && items.length > 0) ? loader : null}
                {droppableProvided.placeholder}
              </ol>
            )
          }}
        </Droppable>
      )
      : (
        <ol
          onKeyDown={this.keyDown(this.props.items)}
          onScroll={this.checkLoader}
          ref={(el) => {
            this.el = el
            this.props.onRef(el)
          }}
          key={`${classes[0]}-list-nodrop`}
        >
          {items}
          {(items.length === 0) ? this.props.empty : null}
          {(this.props.hasMore && items.length > 0) ? loader : null}
        </ol>
      )
    return (
      <div key={`${classes[0]}-list`} className={classes.join(' ')}>
        {/* TODO handle `this.props.collapsible && !this.props.showLabel` */}
        {(this.props.showLabel && this.props.hideLabel && this.props.items.length > 0)
          ? (
            <h3
              onClick={this.toggleCollapsed}
            >
              {this.state.collapsed ? this.props.showLabel : this.props.hideLabel}
            </h3>
          ) : null
        }
        {dropZone}
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'query', type: PropTypes.string, val: '' },
  { name: 'onUp', type: PropTypes.func, val: () => {} },
  { name: 'onRef', type: PropTypes.func, val: () => {} },
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
  { name: 'empty', type: PropTypes.element, val: <li className='emptyPlaceholder' /> },
  { name: 'hidden', type: PropTypes.bool, val: false },
  { name: 'loadsMore', type: PropTypes.bool, val: false },
  { name: 'componentProps', type: PropTypes.object, val: {} }
]

List.defaultProps = defaultProps(props)
List.propTypes = propTypes(props)

export default List

function isElementInViewport (el) {
  var rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
