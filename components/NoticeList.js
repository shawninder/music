import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Notice from './Notice'

import lengths from '../styles/lengths'
import durations from '../styles/durations'
import colors from '../styles/colors'

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
            top: 45px;
            right: 45px;
            max-width: 450px;
            z-index: 5;
            list-style: none;
            font-family: palatino;
            font-size: x-large;
            background-color: ${colors.warnBg};
            padding: 15px;
            border: 2px solid ${colors.text};
            border-radius: ${lengths.noticeRadius} 0 ${lengths.noticeRadius} ${lengths.noticeRadius};
            transition-property: opacity;
            transition-duration: ${durations.instant};
            opacity: 0;

            &:before {
              content: "";
              width: 0px;
              height: 0px;
              position: absolute;
              border-left: 0;
              border-right: 25px solid ${colors.text};
              border-top: 10px solid transparent;
              border-bottom: 15px solid transparent;
              right: -4px;
              top: -8px;
              transform: rotate(15deg);
            }
            &:after {
              content: "";
              width: 0px;
              height: 0px;
              position: absolute;
              border-left: 0;
              border-right: 20px solid ${colors.warnBg};
              border-top: 10px solid transparent;
              border-bottom: 15px solid transparent;
              right: -3px;
              top: -7px;
              transform: rotate(15deg);
            }
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
