import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Log extends Component {
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('log')
    const { name, type, key, ...rest } = this.props.data.data
    return (
      <div
        className={classes.join(' ')}
      >
        <h3>{name}</h3>
        <pre>
          {JSON.stringify(rest, null, 2)}
        </pre>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired }
]

Log.defaultProps = defaultProps(props)
Log.propTypes = propTypes(props)

export default Log
