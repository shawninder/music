import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Action extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }

  onClick (event) {
    event.stopPropagation()
    this.props.go(this.props.data)
  }

  render () {
    return (
      <button
        key={this.props.txt}
        className={this.props.className}
        onClick={this.onClick}
        tabIndex='-1'
      >
        {this.props.inline || this.props.txt}
      </button>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'go', type: PropTypes.func.isRequired },
  { name: 'txt', type: PropTypes.string.isRequired },
  { name: 'inline', type: PropTypes.node, val: null }
]

Action.defaultProps = defaultProps(props)

Action.propTypes = propTypes(props)

export default Action
