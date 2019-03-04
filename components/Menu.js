import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import durations from '../styles/durations'
import lengths from '../styles/lengths'
import tfns from '../styles/timing-functions'

import List from './List'
import MenuItem from './MenuItem'
import Integration from './Integration'
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
      maxWidth: '100vw',
      maxHeight: '100vh',
      overflowY: 'scroll',
      overflowScrolling: 'touch'
    }
    const collapsed = {
      overflow: 'hidden',
      maxHeight: lengths.collapsedHeight
    }

    const integrations = [
      { name: 'YouTube', key: 'youtube-integration', icon: '/static/youtube.png' },
      { name: 'iTunes', key: 'itunes-integration', icon: '/static/itunes.svg' },
      { name: 'Spotify', key: 'spotify-integration', icon: '/static/spotify.png' },
      { name: 'Other', key: 'other-integration', icon: '/static/plus.svg', alt: 'Request support for another service' }
    ]

    const computerApps = [
      { name: 'Linux', key: 'youtube-integration', icon: '/static/linux.png' },
      { name: 'Mac', key: 'itunes-integration', icon: '/static/mac.svg' },
      { name: 'Windows', key: 'spotify-integration', icon: '/static/windows.svg' }
    ]

    const phoneApps = [
      { name: 'Android', key: 'android-integration', icon: '/static/android.svg' },
      { name: 'iOS', key: 'ios-integration', icon: '/static/ios.png' }
    ]

    return (
      <div
        className='menu'
        onKeyDown={this.onKeyDown}
        tabIndex='0'
        style={this.state.collapsed ? collapsed : opened}
      >
        <div className='tab' onClick={this.onClick}>
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
        </div>
        <div className='contents' style={this.state.collapsed ? { opacity: 0 } : { opacity: 1 }}>
          {this.props.showWIP ? (
            <MenuItem
              label='Login'
              startsOpen
            >
              <div className='login'>
                <label>@<input type='email' /></label>
                <p>We'll send you a login link via e-mail</p>
                <p>Click the login link we sent to <em>your@email.com</em></p>
              </div>
            </MenuItem>
          ) : null}
          {this.props.showWIP ? (
            <MenuItem
              label='Connect your other accounts'
            >
              <div className='integrations'>
                <List items={integrations} defaultComponent={Integration} />
              </div>
            </MenuItem>
          ) : null}
          {this.props.showWIP ? (
            <MenuItem
              label='Settings'
            >
              <div className='settings'>
                settings
              </div>
            </MenuItem>
          ) : null}
          {this.props.showWIP ? (
            <MenuItem
              label='Get the app'
            >
              <div className='apps'>
                <List items={computerApps} defaultComponent={Integration} />
                <List items={phoneApps} defaultComponent={Integration} />
                <Integration
                  key='request-new-device'
                  data={{
                    name: 'Other devices',
                    icon: '/static/plus.svg',
                    alt: 'Request support for another class of device'
                  }}
                />
              </div>
            </MenuItem>
          ) : null}
          <Links dict={this.props.dict} showWIP={this.props.showWIP} />
        </div>
        <style jsx>{`
          .menu {
            position: fixed;
            top: 0;
            right: 0;
            max-width: ${lengths.rowHeight};
            border-radius: 0 0 0 3px;
            font-size: medium;
            z-index: 4;
            color: ${colors.text};
            background-color: ${colors.textBg};
            transition-property: max-width, max-height, background-color;
            transition-duration: ${durations.moment};
            transition-timing-function: ${tfns.easeInOutCirc};
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
              transition-timing-function: ${tfns.easeInOutQuad};
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
              text-align: center;
              .login {
                label {
                  padding: 10px;
                  font-family: monospace;
                  font-size: 2em;
                  input {
                    margin-bottom: 5px;
                    font-size: medium;
                    line-height: 2em;
                    font-family: sans-serif;
                  }
                }
              }
              .integrations {
                :global(li) {
                  display: inline-block;
                }
              }
              .apps :global(.list li) {
                display: inline-block;
              }
            }
          }
          @media (min-width: ${lengths.mediaWidth}) {
            .menu {
              max-width: ${lengths.menuWidth};
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
  { name: 'showWIP', type: PropTypes.bool, val: false },
  { name: 'notify', type: PropTypes.func, val: console.log },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'socket', type: PropTypes.object.isRequired }
]

Menu.defaultProps = defaultProps(props)
Menu.propTypes = propTypes(props)

export default Menu
