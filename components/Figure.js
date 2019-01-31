import React, { Component } from 'react'

import lengths from '../styles/lengths'

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
    const figureClasses = ['figure']
    figureClasses.push(this.props.socket.connected ? 'connected' : 'disconnected')
    if (this.props.partyState.hosting) {
      figureClasses.push('hosting')
    }
    if (this.props.partyState.attending) {
      figureClasses.push('attending')
    }
    return (
      <div
        className={figureClasses.join(' ')}
        onClick={this.onClick}
        onKeyDown={this.figureKeyDown}
        tabIndex='0'
      >
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
            background-repeat: no-repeat;
            background-position: top 10px right 10px;
            background-origin: content-box;
            background-size: 30px 30px;
            transition-property: background-color;
            transition-duration: 0.5s;
            &.disconnected {
              background-image: url('static/asleep.svg');
            }
            &.connected {
              background-image: url('static/manga.svg');
            }
            &.hosting.disconnected {
              background-image: url('static/guilty.svg');
            }
            &.hosting.connected {
              background-image: url('static/happy.svg');
            }
            &.attending.disconnected {
              background-image: url('static/sad.svg')
            }
            &.attending.connected {
              background-image: url('static/glad.svg')
            }
            &.attending.host-disconnected {
              background-image: url('static/sad.svg')
            }
          }
        `}</style>
      </div>
    )
  }
}

export default Figure
