import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import useListeners from '../features/listeners/use'

import styles from './Field.style.js'

function Field (props) {
  const { keyDown } = useListeners({
    enter: props.onEnter,
    down: (event) => {
      event.preventDefault()
      props.onDown(event)
    }
  })
  return (
    <React.Fragment>
      <input
        type='text'
        placeholder={props.placeholder}
        className={props.className}
        autoFocus={props.autoFocus}
        onFocus={props.onFocus}
        onKeyDown={keyDown}
        onChange={props.onChange}
        ref={props.onRef}
        tabIndex='0'
        readOnly={props.readOnly}
      />
      <style jsx>{styles}</style>
    </React.Fragment>
  )
}

const props = [
  { name: 'onFocus', type: PropTypes.func, val: () => {} },
  { name: 'onChange', type: PropTypes.func.isRequired },
  { name: 'onEnter', type: PropTypes.func.isRequired },
  { name: 'onDown', type: PropTypes.func.isRequired },
  { name: 'onRef', type: PropTypes.object, val: React.createRef() },
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'placeholder', type: PropTypes.string, val: '' },
  { name: 'readOnly', type: PropTypes.bool, val: false }
]

Field.defaultProps = defaultProps(props)
Field.propTypes = propTypes(props)

export default Field
