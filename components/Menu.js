import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import durations from '../styles/durations'
import lengths from '../styles/lengths'

import Login from './Login'
import Links from './Links'
import Happy from './icons/Happy'
import Sad from './icons/Sad'

import Engine from './icons/Engine'

class Menu extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)

    this.state = {
      collapsed: true
    }
  }
  onClick (event) {
    event.stopPropagation() // Avoid letting the global click listeners collapse the party
    this.setState({ collapsed: !this.state.collapsed })
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

    const opened = {
      width: '100%',
      height: '100vh'
    }
    const collapsed = {
      overflow: 'hidden',
      height: lengths.collapsedHeight
    }

    return (
      <div
        className='menu'
        onKeyDown={this.onKeyDown}
        tabIndex='0'
        style={this.state.collapsed ? collapsed : opened}
      >
        <section className='tab' onClick={this.onClick}>
          <span className='branding' style={this.state.collapsed ? {} : { opacity: 1 }}>Crowd's Play</span>
          <span
            className='connectivity'
            style={this.state.collapsed ? {} : { opacity: 1 }}
          >
            <Engine
              on={this.props.socket.connected}
            />
          </span>
          <Image className='face' />
        </section>
        <section className='contents' style={this.state.collapsed ? { opacity: 0 } : { opacity: 1 }}>
          <Login dict={this.props.dict} notify={this.props.notify} />
          <Links dict={this.props.dict} />
        </section>
        <style jsx>{`
          .menu {
            position: fixed;
            top: 0;
            right: 0;
            width: ${lengths.rowHeight};
            max-width: 640px;
            border-radius: 0 0 0 3px;
            font-size: medium;
            z-index: 4;
            color: ${colors.text};
            background-color: ${colors.textBg};
            transition-property: width, height, background-color;
            transition-duration: ${durations.instant};
            font-family: palatino;
            box-shadow: -5px 0 5px 0px rgb(0, 0, 0, 0.25);
            .tab {
              padding: 5px;
              height: ${lengths.collapsedHeight};
              cursor: pointer;
            }
            .branding {
              float: left;
              font-weight: bold;
              position: absolute;
              padding: 5px;
              top: 0;
              left: 0;
              opacity: 0;
            }
            .connectivity {
              position: absolute;
              top: 1.5em;
              left: 0;
              padding: 5px;
              font-size: small;
              text-transform: uppercase;
              opacity: 0;
              :global(svg) {
                width: ${lengths.connectivityWidth};
                height: ${lengths.connectivityWidth};
                border-radius: ${lengths.connectivityWidth};
                fill: currentColor;
              }
              :global(svg.on) {
                color: ${colors.attendingBg};
                background-color: ${colors.primary};
              }
              :global(svg.off) {
                color: ${colors.dangerousBg};
                background-color: ${colors.dangerousText};
              }
            }
            .branding, .connectivity, .contents {
              transition-property: opacity;
              transition-duration: ${durations.instant};
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
            .contents {
              margin-top: ${lengths.rowHeight};
              text-align: right;
              padding: 5px;
            }
          }
          @media (min-width: ${lengths.mediaWidth}) {
            .menu {
              width: ${lengths.menuWidth};
              .branding, .connectivity {
                opacity: 1;
              }
            }
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'dict', type: PropTypes.object.isRequired },
  { name: 'notify', type: PropTypes.func, val: console.log },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'socket', type: PropTypes.object.isRequired }
]

Menu.defaultProps = defaultProps(props)
Menu.propTypes = propTypes(props)

export default Menu
