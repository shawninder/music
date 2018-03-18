import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultProps, propTypes } from '../helpers'

class Field extends Component {
  constructor (props) {
    super(props)
    this.keyDown = this.keyDown.bind(this)
  }
  keyDown (event) {
    if (event.keyCode === 13) { // enter
      this.props.onEnter(event)
    }
    if (event.keyCode === 40) { // down
      this.props.onDown()
      event.preventDefault() // Prevent cursor from jumping to the end of the field
    }
  }
  render () {
    return (
      <input
        type="text"
        placeholder={this.props.placeholder}
        className={this.props.className}
        autoFocus={this.props.autoFocus}
        onKeyDown={this.keyDown}
        onChange={this.props.onChange}
        ref={(el) => {
          this.field = el
          this.props.onRef(el)
        }}
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
