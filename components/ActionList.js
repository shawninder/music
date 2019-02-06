import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Action from './Action'

class ActionList extends Component {
  render () {
    const actions = Object.keys(this.props.actions).reduce((arr, key, idx) => {
      const action = this.props.actions[key]
      if (!action.cdn || action.cdn(this.props.queueIndex)) {
        arr.push(
          <li key={key}>
            <Action
              data={this.props.data}
              go={(...args) => {
                this.props.onGo(...args)
                return action.go(...args)
              }}
              txt={action.txt}
              icon={action.icon}
              idx={this.props.idx}
              queueIndex={this.props.queueIndex}
              targetIdx={action.targetIdx}
            />
          </li>
        )
      }
      return arr
    }, [])
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('action-list')
    if (this.props.showing) {
      classes.push('showing')
    } else {
      classes.push('hidden')
    }
    if (this.props.actionsAbove) {
      classes.push('above')
    } else {
      classes.push('below')
    }
    return (
      <ul
        className={classes.join(' ')}
        ref={(ref) => {
          this.props.onRef(ref)
        }}
      >
        {actions.length > 0 ? actions : null}
        <style jsx>{`
          .below {
            grid-area: actionListBelow;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.5);
          }
          .above {
            grid-area: actionListAbove;
            border-radius: 5px 5px 0 0;
            box-shadow: 0 -5px 5px 0 rgba(0, 0, 0, 0.5);
            bottom: 0;
          }
          .action-list {
            width: 90%;
            position: absolute;
            color: dimgrey;
            background: whitesmoke;
            z-index: 5;
          }
          .action-list.hidden {
            display: none;
          }
        `}</style>
      </ul>
    )
  }
}

const props = [
  { name: 'actions', type: PropTypes.object.isRequired },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'showing', type: PropTypes.bool, val: false },
  { name: 'onRef', type: PropTypes.func, val: () => {} },
  { name: 'idx', type: PropTypes.number, val: -1 },
  { name: 'queueIndex', type: PropTypes.oneOfType([ PropTypes.number, PropTypes.bool ]), val: false },
  { name: 'onGo', type: PropTypes.func, val: () => {} },
  { name: 'actionsAbove', type: PropTypes.bool, val: false }
]

ActionList.defaultProps = defaultProps(props)
ActionList.propTypes = propTypes(props)

export default ActionList
