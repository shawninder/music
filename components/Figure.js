import React, { Component } from 'react'

import colors from '../styles/colors'
import durations from '../styles/durations'

import Happy from './icons/Happy'
import Sad from './icons/Sad'

class Figure extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }
  onClick (event) {
    event.stopPropagation() // Avoid letting the global click listeners collapse the party
    if (this.props.partyCollapsed) {
      this.props.dispatch({
        type: 'Bar:setItems',
        data: [],
        hasMore: false,
        nextPageToken: null,
        areCommands: true
      })
      this.props.dispatch({
        type: 'App:showParty'
      })
    } else {
      this.props.dispatch({
        type: 'App:collapseParty'
      })
    }
  }

  onKeyDown (event) {
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      this.props.dispatch({
        type: 'App:collapseParty'
      })
    }
    if (event.keyCode === 32 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // space
      this.props.dispatch({
        type: 'App:toggleMenu'
      })
    }
    if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
      this.props.dispatch({
        type: 'App:showParty'
      })
    }
  }
  render () {
    const Image = (this.props.socket.connected)
      ? Happy
      : Sad

    return (
      <div
        className='figure'
        onClick={this.onClick}
        onKeyDown={this.figureKeyDown}
        tabIndex='0'
      >
        <span className='branding'>Crowd's Play</span>
        <span className='status'>{this.props.socket.connected ? 'connected' : 'disconnected'}</span>
        <Image className='face' />
        <style jsx>{`
          .figure {
            position: fixed;
            top: 0;
            right: 0;
            width: 160px;
            height: 53px;
            padding: 5px;
            border-radius: 0 0 0 3px;
            font-size: medium;
            z-index: 4;
            cursor: pointer;
            color: ${colors.text};
            background-color: ${colors.textBg};
            transition-property: background-color;
            transition-duration: ${durations.moment};
            font-family: palatino;
            .branding {
              float: left;
              font-weight: bold;
              position: absolute;
              padding: 5px;
              top: 0;
              left: 0;
            }
            .status {
              position: absolute;
              bottom: 0;
              left: 0;
              padding: 5px;
              font-size: small;
            }
            .face {
              margin: 5px;
              width: 30px;
              height: 30px;
              float: right;
            }
            &.attending {
              background-color: ${colors.attendingBg};
            }
            &.hosting {
              background-color: ${colors.hosting};
            }
          }
        `}</style>
      </div>
    )
  }
}

export default Figure
