import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultProps, propTypes } from '../srcz/helpers'

const actionable = function (Wrapped, defActs, actions) {
  const defaultActions = Array.isArray(defActs)
    ? defActs
    : [defActs]

  class Actionable extends Component {
    render () {
      const classes = (this.props.className && this.props.className.split(' ')) || []
      classes.push('actionable')
      const actionItems = actions.map((action) => {
        const actionClassName = typeof action.className === 'function'
          ? action.className(this.props.data)
          : action.className
        return (
          <button
            key={action.txt || action.img}
            className={actionClassName}
            onClick={action.go(this.props.data, this.props.dispatch)}
            tabIndex="-1"
          >
            {action.txt}
            {action.img}
          </button>
        )
      })
      return (
        <Wrapped
          className={classes.join(' ')}
          onClick={(event) => {
            defaultActions.forEach((defaultAction) => {
              defaultAction.go(this.props.data, this.props.dispatch)(event)
            })
          }}
          {...this.props}
        >
          {this.props.children}
          <div className="actionable-actions">
            {actionItems}
          </div>
        </Wrapped>
      )
    }
  }

  const props = [
    { name: 'data', type: PropTypes.object.isRequired },
    { name: 'dispatch', type: PropTypes.func.isRequired }
  ]

  Actionable.defaultProps = defaultProps(props)
  Actionable.propTypes = propTypes(props)

  return Actionable
}

export default actionable
