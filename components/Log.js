import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import formatDate from '../helpers/formatDate'

function Log (props) {
  const classes = props.className ? props.className.split(' ') : []
  classes.push('log')
  const { _id, name, type, key, msg, ...rest } = props.data
  const timestamp = _id.toString().substring(0, 8)
  const date = new Date(parseInt(timestamp, 16) * 1000)
  return (
    <div
      className={classes.join(' ')}
    >
      <h3><span className='date'>{formatDate(date)}</span>{name}</h3>
      {msg
        ? <p className='message'>{msg.name || JSON.stringify(msg)}</p>
        : null
      }
      <pre>
        {JSON.stringify(rest, null, 2)}
      </pre>
      <style jsx>{`
        h3 {
          font-weight: bold;
        }
        .date {
          font-weight: normal;
          font-style: italic;
          margin-right: 1em;
        }
      `}</style>
    </div>
  )
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired }
]

Log.defaultProps = defaultProps(props)
Log.propTypes = propTypes(props)

export default Log
