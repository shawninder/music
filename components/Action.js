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
    this.props.go(this.props.data, this.props.idx)
  }

  render () {
    return (
      <button
        key={this.props.txt}
        className={this.props.className}
        onClick={this.onClick}
        tabIndex='-1'
      >
        {this.props.txt
          ? (
            <span className='action-label'>{this.props.txt}</span>
          )
          : null}
        {this.props.icon}
      </button>
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
