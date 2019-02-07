import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'

class Action extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  onClick (event) {
    event.stopPropagation()
    this.props.go(this.props.data, this.props.idx, this.props.queueIndex, event)
  }

  onKeyDown (event) {
    event.stopPropagation()
    const track = event.target.parentNode.parentNode.parentNode.parentNode
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      track.childNodes[0].click()
      track.focus()
    }
    if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
      event.target.childNodes[0].click()
      track.focus()
    }
    if (event.keyCode === 38) { // up
      event.preventDefault()
      const previousSibling = event.target.parentNode.previousSibling
      if (previousSibling) {
        previousSibling.childNodes[0].focus()
      }
    }
    if (event.keyCode === 40) { // down
      event.preventDefault()
      const nextSibling = event.target.parentNode.nextSibling
      if (nextSibling) {
        nextSibling.childNodes[0].focus()
      }
    }
  }

  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('action')
    return (
      <div
        className={classes.join(' ')}
        onClick={this.onClick}
        tabIndex='-1'
        onKeyDown={this.onKeyDown}
      >
        <span className='idx'>{this.props.targetIdx}</span>
        {this.props.txt
          ? (
            <span className='label'>{this.props.txt}</span>
          )
          : null}
        <span className='icon'>{this.props.icon}</span>
        <style jsx>{`
          span, img {
            vertical-align: middle;
          }

          .action:hover {
            color: ${colors.primaryBg};
          }
          .action {
            width: 100%;
            height: 32px;
            display: grid;
            grid-template-columns: 100px 1fr 50px;
            grid-template-rows: 32px;
            grid-template-areas:
              "idx label icon"
          }
          .action:hover {
            background: white;
          }

          .idx, .label {
            line-height: 20px;
            padding: 5px;
          }

          .idx {
            grid-area: idx;
            font-size: x-small;
            text-align: right;
            width: 35px;
          }

          .label {
            grid-area: label;
          }

          .icon {
            grid-area: icon;
            text-align: right;
            padding: 7px;
            width: 100%;
          }

          .icon svg.icon {
            color: ${colors.text2};
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'go', type: PropTypes.func.isRequired },
  { name: 'txt', type: PropTypes.string.isRequired },
  { name: 'icon', type: PropTypes.node, val: null },
  { name: 'idx', type: PropTypes.number, val: -1 },
  { name: 'queueIndex', type: PropTypes.oneOfType([ PropTypes.number, PropTypes.bool ]), val: false }
]

Action.defaultProps = defaultProps(props)

Action.propTypes = propTypes(props)

export default Action
