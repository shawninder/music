import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Range from './Range'

import colors from '../styles/colors'

class Notice extends Component {
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('noticeBody')
    let progress = null
    if (this.props.progress !== -1) {
      progress = (
        <Range key={`sending:${this.props.id}`} className='file-progress' current={this.props.progress} />
      )
    }
    let btns = null
    const buttonKeys = Object.keys(this.props.buttons)
    if (buttonKeys.length !== 0) {
      btns = buttonKeys.map((key) => {
        const { label, cb } = this.props.buttons[key]
        return (
          <button key={label} onClick={cb}>{label}</button>
        )
      })
    }
    return (
      <React.Fragment>
        <p className={classes.join(' ')}>{this.props.body}</p>
        {progress}
        {btns}
        <style global jsx>{`
          .file-progress {
            background: ${colors.textBgEven};
            border: 1px solid #333333;
            height: 10px;
            width: 100px;
          }
          .file-progress--current {
            height: 10px;
            background-color: #333333;
          }
          button {
            margin: 15px 5px 0 0;
            cursor: pointer;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'id', type: PropTypes.string.isRequired },
  { name: 'body', type: PropTypes.string, val: '' },
  { name: 'progress', type: PropTypes.number, val: -1 },
  { name: 'buttons', type: PropTypes.object, val: {} }
]

Notice.defaultProps = defaultProps(props)

Notice.propTypes = propTypes(props)

export default Notice
