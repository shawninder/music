import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Action extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  onClick (event) {
    event.stopPropagation()
    this.props.go(this.props.data, this.props.idx, this.props.queueIndex, event)
  }

  onKeyDown (event) {
    event.stopPropagation()
    const track = event.target.parentNode.parentNode.parentNode.parentNode
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      track.childNodes[0].click()
      track.focus()
    }
    if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
      event.target.childNodes[0].click()
      track.focus()
    }
    if (event.keyCode === 38) { // up
      const previousSibling = event.target.parentNode.previousSibling
      if (previousSibling) {
        previousSibling.childNodes[0].focus()
      }
    }
    if (event.keyCode === 40) { // down
      event.preventDefault()
      const nextSibling = event.target.parentNode.nextSibling
      if (nextSibling) {
        nextSibling.childNodes[0].focus()
      }
    }
  }

  render () {
    return (
      <div
        key={this.props.txt}
        className={this.props.className}
        onClick={this.onClick}
        tabIndex='-1'
        onKeyDown={this.onKeyDown}
      >
        <span className='action-idx'>{this.props.targetIdx}</span>
        {this.props.txt
          ? (
            <span className='action-label'>{this.props.txt}</span>
          )
          : null}
        <span className='action-icon'>{this.props.icon}</span>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'go', type: PropTypes.func.isRequired },
  { name: 'txt', type: PropTypes.string.isRequired },
  { name: 'icon', type: PropTypes.node, val: null },
  { name: 'idx', type: PropTypes.number.isRequired }
]

Action.defaultProps = defaultProps(props)

Action.propTypes = propTypes(props)

export default Action
