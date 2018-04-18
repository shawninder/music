import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash.clonedeep'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class List extends Component {
  constructor (props) {
    super(props)
    this.keyDown = this.keyDown.bind(this)
    this.toggleCollapsed = this.toggleCollapsed.bind(this)

    this.state = {
      collapsed: props.startsCollapsed
    }
  }

  keyDown (items) {
    return (event) => {
      const idx = Array.prototype.indexOf.call(this.el.childNodes, event.target)
      if (idx !== -1 && this.el) { // found and got list ref
        const item = items[idx]
        if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
          if (item.type === 'command') {
            event.target.childNodes[0].click()
          } else {
            this.props.onItem.enter(item, idx)
          }
        }
        if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && event.shiftKey) { // shift+enter
          this.props.onItem['shift+enter'](item, idx)
        }
        if (event.keyCode === 13 && !event.metaKey && event.ctrlKey && !event.shiftKey) { // ctrl+enter
          this.props.onItem['ctrl+enter'](item, idx)
        }
      }
      if (event.keyCode === 38) { // up
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
      const Component = item.Component || this.props.defaultComponent
      delete itemClone.Component
      const node = (
        <Component
          data={itemClone}
          query={this.props.query}
          idx={idx}
        />
      )
      return (
        <li
          key={itemClone.key}
          tabIndex='0'
        >
          {node}
        </li>
      )
    })
    const classes = this.props.className.split(' ')
    classes.push(this.state.collapsed ? 'collapsed' : 'not-collapsed')
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
        <ol
          onKeyDown={this.keyDown(this.props.items)}
          ref={(el) => {
            this.el = el
            this.props.onRef(el)
          }}
        >
          {items}
        </ol>
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
  { name: 'collapsible', type: PropTypes.bool, val: false }
]

List.defaultProps = defaultProps(props)
List.propTypes = propTypes(props)

export default List
