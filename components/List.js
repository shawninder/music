import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultProps, propTypes } from '../srcz/helpers'

class List extends Component {
  constructor (props) {
    super(props)
    this.keyDown = this.keyDown.bind(this)
  }
  keyDown () {
    return (event) => {
      if (event.keyCode === 13) { // enter
        const idx = Array.prototype.indexOf.call(this.el.childNodes, event.target)
        const item = this.props.items[idx]
        item.go(item)
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

  render () {
    const items = this.props.items.map((item, idx) => {
      const Component = this.props.getComponent(item, idx)
      const el = (
        <Component
          data={item}
          query={this.props.query}
          dispatch={this.props.dispatch}
        />
      )
      return (
        <li
          key={item.key}
          tabIndex="0"
        >
          {el}
        </li>
      )
    })
    return (
      <div className={this.props.className}>
        {this.props.title
          ? <h3>{this.props.title}</h3>
          : null
        }
        <ol
          onKeyDown={this.keyDown()}
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
  { name: 'dispatch', type: PropTypes.func, val: () => {} }
]

List.defaultProps = defaultProps(props)
List.propTypes = propTypes(props)

export default List
