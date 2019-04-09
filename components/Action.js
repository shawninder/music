import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import useListeners from '../features/listeners/use'

import actionStyle from './Action.style'

function Action (props) {
  const { click, keyDown } = useListeners(props.on)

  return (
    <div
      className={'action'}
      onClick={click}
      tabIndex='-1'
      onKeyDown={keyDown}
    >
      <style jsx>{actionStyle}</style>
      <span className='idx'>{props.targetIdx}</span>
      {props.txt
        ? (
          <span className='label'>{props.txt}</span>
        )
        : null}
      <span className='icon'>{props.icon}</span>
    </div>
  )
}

const props = [
  { name: 'txt', type: PropTypes.string.isRequired },
  { name: 'icon', type: PropTypes.node, val: null },
  { name: 'targetIdx', type: PropTypes.number, val: -1 },
  { name: 'on', type: PropTypes.object, val: {} }
]

Action.defaultProps = defaultProps(props)

Action.propTypes = propTypes(props)

export default Action
