import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class PartyStats extends Component {
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('partyStat')

    return (
      <div
        className={classes.join(' ')}
      >
        :)
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired }
]

PartyStats.defaultProps = defaultProps(props)
PartyStats.propTypes = propTypes(props)

export default PartyStats
