import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import highlighted from '../helpers/highlighted'

function Command (props) {
  return (
    <div className='command' key={props.data.key} onClick={(event) => {
      event.stopPropagation()
      return props.data.go(props.data)
    }}>
      {highlighted(props.data.key, props.data.matches)}
      <style jsx>{`
        .command {
          padding: 12px;
          line-height: 150%;
          cursor: pointer;
          font-size: large;
          border: 0;
        }
      `}</style>
    </div>
  )
}

const props = [
  { name: 'data', type: PropTypes.object.isRequired }
]

Command.defaultProps = defaultProps(props)
Command.propTypes = propTypes(props)

export default Command
