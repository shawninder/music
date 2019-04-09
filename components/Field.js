import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import useListeners from '../features/listeners/use'

import lengths from '../styles/lengths'
import durations from '../styles/durations'
import colors from '../styles/colors'

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
      />
      <style jsx>{`
        input {
          position: fixed;
          top: 0;
          height: ${lengths.rowHeight};
          width: 100%;
          font-size: large;
          font-weight: bold;
          padding: 5px 100px 5px 60px;
          z-index: 4;
          border: 0;
          color: ${colors.textBg};
          background: ${colors.text};
          border-radius: 0;
          box-shadow: 0px 5px 5px 0px rgb(0,0,0,0.25);
          transition-property: background-color;
          transition-duration: ${durations.moment};
          &::placeholder {
            color: ${colors.placeholder};
          }
        }
        @media (min-width: ${lengths.mediaWidth}) {
          padding: 5px 215px 5px 60px;
        }
      `}</style>
    </React.Fragment>
  )
}

const props = [
  { name: 'onFocus', type: PropTypes.func, val: () => {} },
  { name: 'onChange', type: PropTypes.func.isRequired },
  { name: 'onEnter', type: PropTypes.func.isRequired },
  { name: 'onDown', type: PropTypes.func.isRequired },
  { name: 'onRef', type: PropTypes.object.isRequired },
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'placeholder', type: PropTypes.string, val: '' }
]

Field.defaultProps = defaultProps(props)
Field.propTypes = propTypes(props)

export default Field
