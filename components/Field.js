import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import lengths from '../styles/lengths'
import durations from '../styles/durations'
import colors from '../styles/colors'

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
  }
  render () {
    return (
      <React.Fragment>
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
        <style jsx>{`
          input {
            position: fixed;
            top: 0;
            height: ${lengths.rowHeight};
            width: 100%;
            font-size: large;
            font-weight: bold;
            padding: 5px 80px 5px 60px;
            z-index: 4;
            border: 0;
            color: ${colors.white};
            background: ${colors.text};
            border-radius: 0;
            box-shadow: 0px 5px 5px 0px rgb(0,0,0,0.25);
            transition-property: background-color;
            transition-duration: ${durations.moment};
            &::placeholder {
              color: ${colors.placeholder};
            }
          }
        `}</style>
      </React.Fragment>
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
