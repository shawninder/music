import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Field extends Component {
  constructor (props) {
    super(props)
    this.keyDown = this.keyDown.bind(this)
  }
  keyDown (event) {
    if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
      this.props.onEnter(event)
    }
    if (event.keyCode === 40 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // down
      this.props.onDown()
      event.preventDefault() // Prevent cursor from jumping to the end of the field
    }
    if (event.keyCode === 39 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // right
      event.stopPropagation()
    }
    if (event.keyCode === 37 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // left
      event.stopPropagation()
    }
  }
  render () {
    return (
      <input
        type='text'
        placeholder={this.props.placeholder}
        className={this.props.className}
        autoFocus={this.props.autoFocus}
        onKeyDown={this.keyDown}
        onChange={this.props.onChange}
        ref={(el) => {
          this.field = el
          this.props.onRef(el)
        }}
        tabIndex='0'
      />
    )
  }
}

const props = [
  { name: 'onChange', type: PropTypes.func.isRequired },
  { name: 'onEnter', type: PropTypes.func.isRequired },
  { name: 'onDown', type: PropTypes.func.isRequired },
  { name: 'onRef', type: PropTypes.func.isRequired },
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'placeholder', type: PropTypes.string, val: '' }
]

Field.defaultProps = defaultProps(props)
Field.propTypes = propTypes(props)

export default Field
