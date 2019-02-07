import React, { Component } from 'react'

import colors from '../styles/colors'
import lengths from '../styles/lengths'
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
        <Image className='face' />
        <style jsx>{`
          .figure {
            position: fixed;
            top: 0;
            right: 0;
            width: ${lengths.rowHeight};
            height: ${lengths.rowHeight};
            font-size: large;
            z-index: 4;
            cursor: pointer;
            background-color: ${colors.primary};
            transition-property: background-color;
            transition-duration: ${durations.moment};
            .face {
              margin: 10px;
              width: 30px;
              height: 30px;
            }
            &.disconnected {
              background-image: url('/static/sad.svg');
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
