import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Notice from './Notice'

class NoticeList extends Component {
  render () {
    const notices = this.props.notices.map(({ id, body, progress, buttons, duration }) => {
      return (
        <li key={id}>
          <Notice
            id={id}
            body={body}
            progress={progress}
            buttons={buttons}
            duration={duration}
          />
        </li>
      )
    })
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('notice-list')
    if (this.props.showing) {
      classes.push('showing')
    } else {
      classes.push('hidden')
    }
    return (
      <ul
        className={classes.join(' ')}
      >
        {notices.length > 0 ? notices : null}
        <style jsx>{`
          .notice-list {
            position: fixed;
            top: 15px;
            right: 10px;
            max-width: 450px;
            z-index: 5;
            list-style: none;
            background-color: #d59925;
            padding: 7px;
            border-radius: 4px;
            transition-property: opacity;
            transition-duration: 0.1s;
            opacity: 0;
          }
          .notice-list.showing {
            opacity: 1;
          }
          .notice-list li {
            margin-bottom: 10px;
          }
          .notice-list button {
            margin: 15px 5px 0 0;
          }
          input[type=file] {
            margin: 10px;
            cursor: pointer;
          }
        `}</style>
      </ul>
    )
  }
}

const props = [
  { name: 'notices', type: PropTypes.array.isRequired },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'showing', type: PropTypes.bool, val: false }
]

NoticeList.defaultProps = defaultProps(props)
NoticeList.propTypes = propTypes(props)

export default NoticeList
