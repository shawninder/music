import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Log extends Component {
  render () {
    const classes = this.props.className.split(' ')
    classes.push('log')
    return (
      <div
        className={classes.join(' ')}
      >
        <pre>
          {JSON.stringify(this.props.data)}
        </pre>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'adminUsername', type: PropTypes.string.isRequired },
  { name: 'adminPassword', type: PropTypes.string.isRequired }
]

Log.defaultProps = defaultProps(props)
Log.propTypes = propTypes(props)

export default Log
