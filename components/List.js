import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import { Droppable, Draggable } from 'react-beautiful-dnd'

const isServer = typeof window === 'undefined'

const isElementInViewport = (el) => {
  var rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

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
    this.checkLoader = this.checkLoader.bind(this)
    this.loader = null
  }

  componentDidMount () {
    if (!isServer) {
      // see https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
      if (global.addEventListener) {
        global.addEventListener('DOMContentLoaded', this.checkLoader, false)
        global.addEventListener('load', this.checkLoader, false)
        global.addEventListener('scroll', this.checkLoader, false)
        global.addEventListener('resize', this.checkLoader, false)
      } else if (global.attachEvent) {
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
        global.removeEventListener('DOMContentLoaded', this.checkLoader, false)
        global.removeEventListener('load', this.checkLoader, false)
        global.removeEventListener('scroll', this.checkLoader, false)
        global.removeEventListener('resize', this.checkLoader, false)
      } else if (global.detachEvent) {
        global.detachEvent('onDOMContentLoaded', this.checkLoader)
        global.detachEvent('onload', this.checkLoader)
        global.detachEvent('onscroll', this.checkLoader)
        global.detachEvent('onresize', this.checkLoader)
      }
    }
  }

  checkLoader (event) {
    if (this.loader) {
      if (this.props.items.length < this.props.maxResults && isElementInViewport(this.loader)) {
        this.props.loadMore()
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!isEqual(this.previousCollapsed, nextState.collapsed) ||
      !isEqual(this.previousItems, nextProps.items)
    ) {
      this.previousItems = nextProps.items
      this.previousCollapsed = nextState.collapsed
      return true
    }
    return false
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
        ) {
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
    const items = this.props.items.map((item, idx) => {
      const itemClone = cloneDeep(item)
      delete itemClone.Component
      const Component = item.Component || this.props.defaultComponent
      if (this.props.areDraggable) {
        return (
          <Draggable key={`draggable-${itemClone.key}`} draggableId={`draggable-${itemClone.key}`} index={idx}>
            {(draggableProvided, snapshot) => {
              return (
                <li
                  key={`${classes[0]}-list-draggable-${itemClone.key}`}
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
                    key={`${this.props.className.split(' ')[0]}-Component-${itemClone.data.id.videoId}`}
                  />
                </li>
              )
            }}
          </Draggable>
        )
      } else {
        return (
          <li
            key={`${classes[0]}-list-nodrag-${itemClone.key}`}
            tabIndex='0'
          >
            <Component
              data={itemClone}
              query={this.props.query}
              idx={idx}
            />
          </li>
        )
      }
    })
    const loader = <li className='loader' ref={(el) => { this.loader = el }} />
    const classes = this.props.className.split(' ')
    classes.push('list')
    classes.push(this.state.collapsed ? 'collapsed' : 'not-collapsed')

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
              >
                {items}
                {items.length > 0 ? loader : null}
                {droppableProvided.placeholder}
              </ol>
            )
          }}
        </Droppable>
      )
      : (
        <ol
          onKeyDown={this.keyDown(this.props.items)}
          ref={(el) => {
            this.el = el
            this.props.onRef(el)
          }}
          key={`${classes[0]}-list-nodrop`}
        >
          {items}
          {items.length > 0 ? loader : null}
        </ol>
      )
    return (
      <div className={classes.join(' ')}>
        {/* TODO handle `this.props.collapsible && !this.props.title` */}
        {this.props.title
          ? (
            <h3
              onClick={this.toggleCollapsed}
            >
              {this.props.title}
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
  { name: 'maxResults', type: PropTypes.number, val: 200 }
]

List.defaultProps = defaultProps(props)
List.propTypes = propTypes(props)

export default List
